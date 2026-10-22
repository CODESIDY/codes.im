/**
 * Infer TypeScript declarations from a JSON value.
 *
 * Objects become named declarations; arrays merge their element shapes so keys
 * that are missing from some elements become optional.
 */

export type Shape =
  | { kind: 'primitive'; name: 'string' | 'number' | 'boolean' | 'null' | 'unknown' }
  | { kind: 'array'; of: Shape }
  | { kind: 'object'; fields: Map<string, { shape: Shape; optional: boolean }> }
  | { kind: 'union'; of: Shape[] };

export interface Options {
  rootName?: string;
  style?: 'interface' | 'type';
  /** Prefix declarations with `export`. */
  exported?: boolean;
}

export function infer(v: unknown): Shape {
  if (v === null) return { kind: 'primitive', name: 'null' };
  if (Array.isArray(v)) {
    if (!v.length) return { kind: 'array', of: { kind: 'primitive', name: 'unknown' } };
    return { kind: 'array', of: v.map(infer).reduce(merge) };
  }
  switch (typeof v) {
    case 'string':
      return { kind: 'primitive', name: 'string' };
    case 'number':
      return { kind: 'primitive', name: 'number' };
    case 'boolean':
      return { kind: 'primitive', name: 'boolean' };
    case 'object': {
      const fields = new Map<string, { shape: Shape; optional: boolean }>();
      for (const [k, val] of Object.entries(v as object)) fields.set(k, { shape: infer(val), optional: false });
      return { kind: 'object', fields };
    }
    default:
      return { kind: 'primitive', name: 'unknown' };
  }
}

function members(s: Shape): Shape[] {
  return s.kind === 'union' ? s.of : [s];
}

function same(a: Shape, b: Shape): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'primitive') return a.name === (b as typeof a).name;
  if (a.kind === 'array') return same(a.of, (b as typeof a).of);
  return a.kind === 'object';
}

export function merge(a: Shape, b: Shape): Shape {
  if (a.kind === 'primitive' && a.name === 'unknown') return b;
  if (b.kind === 'primitive' && b.name === 'unknown') return a;
  if (a.kind === 'object' && b.kind === 'object') {
    const fields = new Map<string, { shape: Shape; optional: boolean }>();
    for (const [k, fa] of a.fields) {
      const fb = b.fields.get(k);
      fields.set(k, fb ? { shape: merge(fa.shape, fb.shape), optional: fa.optional || fb.optional } : { ...fa, optional: true });
    }
    for (const [k, fb] of b.fields) if (!a.fields.has(k)) fields.set(k, { ...fb, optional: true });
    return { kind: 'object', fields };
  }
  if (a.kind === 'array' && b.kind === 'array') return { kind: 'array', of: merge(a.of, b.of) };

  // Build a union, merging same-kind members (objects with objects, arrays with arrays).
  const out: Shape[] = [];
  for (const m of [...members(a), ...members(b)]) {
    const i = out.findIndex((o) => o.kind === m.kind && (m.kind === 'object' || m.kind === 'array' || same(o, m)));
    if (i === -1) out.push(m);
    else out[i] = m.kind === 'primitive' ? out[i] : merge(out[i], m);
  }
  return out.length === 1 ? out[0] : { kind: 'union', of: out };
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function pascal(s: string): string {
  const p = s
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
  if (!p) return 'Item';
  return /^[0-9]/.test(p) ? `T${p}` : p;
}

function singular(s: string): string {
  if (/ies$/i.test(s)) return s.slice(0, -3) + 'y';
  if (/(ss|us)$/i.test(s)) return s;
  if (/s$/i.test(s) && s.length > 1) return s.slice(0, -1);
  return s + 'Item';
}

export function jsonToTs(value: unknown, opts: Options = {}): string {
  const { rootName = 'Root', style = 'interface', exported = true } = opts;
  const decls: string[] = [];
  const used = new Set<string>();
  const prefix = exported ? 'export ' : '';

  const uniqueName = (base: string) => {
    let name = pascal(base);
    let n = 2;
    while (used.has(name)) name = `${pascal(base)}${n++}`;
    used.add(name);
    return name;
  };

  const render = (s: Shape, hint: string): string => {
    switch (s.kind) {
      case 'primitive':
        return s.name;
      case 'array': {
        const inner = render(s.of, singular(hint));
        return s.of.kind === 'union' ? `(${inner})[]` : `${inner}[]`;
      }
      case 'union':
        return s.of
          .map((m) => render(m, hint))
          .sort((x, y) => (x === 'null' ? 1 : y === 'null' ? -1 : 0))
          .join(' | ');
      case 'object': {
        const name = uniqueName(hint);
        const slot = decls.length;
        decls.push(''); // reserve position so parents come before children
        const lines = [...s.fields].map(([k, f]) => {
          const key = IDENT.test(k) ? k : JSON.stringify(k);
          return `  ${key}${f.optional ? '?' : ''}: ${render(f.shape, k)};`;
        });
        const body = lines.length ? `{\n${lines.join('\n')}\n}` : '{}';
        decls[slot] =
          style === 'interface' ? `${prefix}interface ${name} ${body}` : `${prefix}type ${name} = ${body};`;
        return name;
      }
    }
  };

  const shape = infer(value);
  const root = render(shape, rootName);
  if (shape.kind !== 'object') {
    const name = uniqueName(rootName);
    decls.unshift(`${prefix}type ${name} = ${root};`);
  }
  return decls.join('\n\n') + '\n';
}
