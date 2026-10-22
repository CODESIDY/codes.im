// A small, safe JSONPath implementation (RFC 9535 subset) — no eval.
//
// Supported: $  @  .name  ['name']  [0]  [-1]  [start:end:step]  [*]  .*  ..name  ..*  [a,b]
// Filters:   [?(@.price < 10 && @.tags)]  with == != < <= > >= && || ! ( ) and literals
//            (numbers, 'strings', "strings", true, false, null), plus `=~ /regex/flags`.
//            The surrounding parentheses after ? are optional.

type Json = unknown;
export interface Match {
  /** Normalized path, e.g. $['store']['book'][0]['title']. */
  path: string;
  value: Json;
}

type Selector =
  | { t: 'name'; name: string }
  | { t: 'index'; i: number }
  | { t: 'slice'; start?: number; end?: number; step?: number }
  | { t: 'wild' }
  | { t: 'filter'; expr: Expr };
type Segment = { desc: boolean; sels: Selector[] };

type Expr =
  | { k: 'lit'; v: Json }
  | { k: 'path'; root: '@' | '$'; segs: Segment[] }
  | { k: 'not'; e: Expr }
  | { k: 'bin'; op: string; a: Expr; b: Expr }
  | { k: 're'; e: Expr; re: RegExp };

class Parser {
  i = 0;
  s: string;
  constructor(s: string) {
    this.s = s;
  }
  peek(n = 0) {
    return this.s[this.i + n];
  }
  ws() {
    while (/\s/.test(this.peek() ?? '')) this.i++;
  }
  eat(str: string) {
    this.ws();
    if (this.s.startsWith(str, this.i)) {
      this.i += str.length;
      return true;
    }
    return false;
  }
  expect(str: string) {
    if (!this.eat(str)) this.fail(`Expected "${str}"`);
  }
  fail(msg: string): never {
    throw new Error(`${msg} at position ${this.i + 1}`);
  }

  name(): string {
    const m = /^[\p{L}_$][\p{L}\p{N}_$-]*/u.exec(this.s.slice(this.i));
    if (!m) this.fail('Expected a member name');
    this.i += m[0].length;
    return m[0];
  }
  str(): string {
    const q = this.peek();
    this.i++;
    let out = '';
    while (this.i < this.s.length && this.peek() !== q) {
      if (this.peek() === '\\') {
        this.i++;
        const c = this.peek();
        out += c === 'n' ? '\n' : c === 't' ? '\t' : c;
      } else out += this.peek();
      this.i++;
    }
    if (this.peek() !== q) this.fail('Unterminated string');
    this.i++;
    return out;
  }
  int(): number | undefined {
    this.ws();
    const m = /^-?\d+/.exec(this.s.slice(this.i));
    if (!m) return undefined;
    this.i += m[0].length;
    return Number(m[0]);
  }

  segments(): Segment[] {
    const segs: Segment[] = [];
    for (;;) {
      this.ws();
      if (this.s.startsWith('..', this.i)) {
        this.i += 2;
        if (this.peek() === '[') segs.push({ desc: true, sels: this.bracket() });
        else if (this.peek() === '*') {
          this.i++;
          segs.push({ desc: true, sels: [{ t: 'wild' }] });
        } else segs.push({ desc: true, sels: [{ t: 'name', name: this.name() }] });
      } else if (this.peek() === '.') {
        this.i++;
        if (this.peek() === '*') {
          this.i++;
          segs.push({ desc: false, sels: [{ t: 'wild' }] });
        } else segs.push({ desc: false, sels: [{ t: 'name', name: this.name() }] });
      } else if (this.peek() === '[') segs.push({ desc: false, sels: this.bracket() });
      else return segs;
    }
  }

  bracket(): Selector[] {
    this.expect('[');
    const sels: Selector[] = [];
    do {
      this.ws();
      const c = this.peek();
      if (c === "'" || c === '"') sels.push({ t: 'name', name: this.str() });
      else if (c === '*') {
        this.i++;
        sels.push({ t: 'wild' });
      } else if (c === '?') {
        this.i++;
        sels.push({ t: 'filter', expr: this.or() });
      } else {
        const start = this.int();
        this.ws();
        if (this.peek() === ':') {
          this.i++;
          const end = this.int();
          let step: number | undefined;
          if (this.eat(':')) step = this.int();
          sels.push({ t: 'slice', start, end, step });
        } else if (start !== undefined) sels.push({ t: 'index', i: start });
        else this.fail('Invalid selector');
      }
    } while (this.eat(','));
    this.expect(']');
    return sels;
  }

  // ---- filter expressions ----
  or(): Expr {
    let a = this.and();
    while (this.eat('||')) a = { k: 'bin', op: '||', a, b: this.and() };
    return a;
  }
  and(): Expr {
    let a = this.cmp();
    while (this.eat('&&')) a = { k: 'bin', op: '&&', a, b: this.cmp() };
    return a;
  }
  cmp(): Expr {
    const a = this.unary();
    this.ws();
    if (this.eat('=~')) {
      this.ws();
      if (this.peek() !== '/') this.fail('Expected /regex/');
      this.i++;
      let src = '';
      while (this.i < this.s.length && this.peek() !== '/') {
        if (this.peek() === '\\') src += this.s[this.i++];
        src += this.s[this.i++];
      }
      this.expect('/');
      const flags = /^[gimsuy]*/.exec(this.s.slice(this.i))![0];
      this.i += flags.length;
      return { k: 're', e: a, re: new RegExp(src, flags.replace('g', '')) };
    }
    for (const op of ['==', '!=', '<=', '>=', '<', '>']) {
      if (this.eat(op)) return { k: 'bin', op, a, b: this.unary() };
    }
    return a;
  }
  unary(): Expr {
    this.ws();
    if (this.eat('!')) return { k: 'not', e: this.unary() };
    if (this.eat('(')) {
      const e = this.or();
      this.expect(')');
      return e;
    }
    const c = this.peek();
    if (c === '@' || c === '$') {
      this.i++;
      return { k: 'path', root: c, segs: this.segments() };
    }
    if (c === "'" || c === '"') return { k: 'lit', v: this.str() };
    const num = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(this.s.slice(this.i));
    if (num) {
      this.i += num[0].length;
      return { k: 'lit', v: Number(num[0]) };
    }
    for (const [w, v] of [
      ['true', true],
      ['false', false],
      ['null', null],
    ] as const) {
      if (this.s.startsWith(w, this.i)) {
        this.i += w.length;
        return { k: 'lit', v };
      }
    }
    this.fail('Invalid filter expression');
  }
}

export function parsePath(path: string): Segment[] {
  const p = new Parser(path.trim());
  if (!p.eat('$')) p.fail('A JSONPath must start with $');
  const segs = p.segments();
  p.ws();
  if (p.i < p.s.length) p.fail(`Unexpected "${p.peek()}"`);
  return segs;
}

const isObj = (x: Json): x is Record<string, Json> => !!x && typeof x === 'object' && !Array.isArray(x);
const fmtName = (k: string) => `['${k.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}']`;

function children(node: Match): Match[] {
  const v = node.value;
  if (Array.isArray(v)) return v.map((x, i) => ({ path: `${node.path}[${i}]`, value: x }));
  if (isObj(v)) return Object.entries(v).map(([k, x]) => ({ path: node.path + fmtName(k), value: x }));
  return [];
}

function descendants(node: Match): Match[] {
  const out: Match[] = [node];
  for (const c of children(node)) out.push(...descendants(c));
  return out;
}

function select(node: Match, sel: Selector, root: Json): Match[] {
  const v = node.value;
  switch (sel.t) {
    case 'name':
      return isObj(v) && Object.hasOwn(v, sel.name) ? [{ path: node.path + fmtName(sel.name), value: v[sel.name] }] : [];
    case 'index': {
      if (!Array.isArray(v)) return [];
      const i = sel.i < 0 ? v.length + sel.i : sel.i;
      return i >= 0 && i < v.length ? [{ path: `${node.path}[${i}]`, value: v[i] }] : [];
    }
    case 'wild':
      return children(node);
    case 'slice': {
      if (!Array.isArray(v)) return [];
      const n = v.length;
      const step = sel.step ?? 1;
      if (step === 0) return [];
      const norm = (x: number) => (x < 0 ? Math.max(n + x, step > 0 ? 0 : -1) : Math.min(x, step > 0 ? n : n - 1));
      const start = sel.start === undefined ? (step > 0 ? 0 : n - 1) : norm(sel.start);
      const end = sel.end === undefined ? (step > 0 ? n : -1) : norm(sel.end);
      const out: Match[] = [];
      for (let i = start; step > 0 ? i < end : i > end; i += step) out.push({ path: `${node.path}[${i}]`, value: v[i] });
      return out;
    }
    case 'filter':
      return children(node).filter((c) => truthy(evalExpr(sel.expr, c.value, root)));
  }
}

const NOTHING = Symbol('nothing');
type Val = Json | typeof NOTHING;

function truthy(v: Val): boolean {
  return v !== NOTHING && v !== false && v !== null && v !== undefined;
}

function evalExpr(e: Expr, cur: Json, root: Json): Val {
  switch (e.k) {
    case 'lit':
      return e.v;
    case 'path': {
      const r = run(e.segs, e.root === '@' ? cur : root, root);
      return r.length ? r[0].value : NOTHING;
    }
    case 'not':
      return !truthy(evalExpr(e.e, cur, root));
    case 're': {
      const v = evalExpr(e.e, cur, root);
      return typeof v === 'string' && e.re.test(v);
    }
    case 'bin': {
      if (e.op === '&&') return truthy(evalExpr(e.a, cur, root)) && truthy(evalExpr(e.b, cur, root));
      if (e.op === '||') return truthy(evalExpr(e.a, cur, root)) || truthy(evalExpr(e.b, cur, root));
      const a = evalExpr(e.a, cur, root);
      const b = evalExpr(e.b, cur, root);
      if (e.op === '==') return deepEqual(a, b);
      if (e.op === '!=') return !deepEqual(a, b);
      const comparable = (typeof a === 'number' && typeof b === 'number') || (typeof a === 'string' && typeof b === 'string');
      if (!comparable) return false;
      const x = a as number | string;
      const y = b as number | string;
      return e.op === '<' ? x < y : e.op === '<=' ? x <= y : e.op === '>' ? x > y : x >= y;
    }
  }
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || !a || !b || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === (b as unknown[]).length && a.every((x, i) => deepEqual(x, (b as unknown[])[i]));
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(b as object, k) && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function run(segs: Segment[], start: Json, root: Json): Match[] {
  let nodes: Match[] = [{ path: '$', value: start }];
  for (const seg of segs) {
    const next: Match[] = [];
    for (const n of nodes) {
      const bases = seg.desc ? descendants(n) : [n];
      for (const b of bases) for (const s of seg.sels) next.push(...select(b, s, root));
    }
    nodes = next;
  }
  return nodes;
}

/** Evaluate a JSONPath query against a parsed JSON document. */
export function query(doc: Json, path: string): Match[] {
  return run(parsePath(path), doc, doc);
}
