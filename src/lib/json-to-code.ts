// Generate typed models from sample JSON: Pydantic (Python), Go structs and Rust serde structs.
import { infer, type Shape } from './json-to-ts.ts';

export type CodeLang = 'pydantic' | 'go' | 'rust';

const words = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

export const pascal = (s: string) => {
  const p = words(s)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
  if (!p) return 'Item';
  return /^[0-9]/.test(p) ? `T${p}` : p;
};

export const snake = (s: string) => {
  const p = words(s)
    .map((w) => w.toLowerCase())
    .join('_');
  if (!p) return 'field';
  return /^[0-9]/.test(p) ? `f_${p}` : p;
};

function singular(s: string): string {
  if (/ies$/i.test(s)) return s.slice(0, -3) + 'y';
  if (/(ss|us)$/i.test(s)) return s;
  if (/s$/i.test(s) && s.length > 1) return s.slice(0, -1);
  return s + 'Item';
}

const isNull = (s: Shape) => s.kind === 'primitive' && s.name === 'null';

/** Split "T | null" into the non-null part and a nullable flag. */
function unwrapNull(s: Shape): { inner: Shape; nullable: boolean } {
  if (isNull(s)) return { inner: { kind: 'primitive', name: 'unknown' }, nullable: true };
  if (s.kind === 'union') {
    const rest = s.of.filter((m) => !isNull(m));
    if (rest.length !== s.of.length) return { inner: rest.length === 1 ? rest[0] : { kind: 'union', of: rest }, nullable: true };
  }
  return { inner: s, nullable: false };
}

interface Emitter {
  prim(name: string): string;
  array(inner: string): string;
  union(parts: string[]): string;
  optional(t: string): string;
  struct(name: string, fields: { key: string; type: string; optional: boolean; nullable: boolean }[]): string;
  header(): string;
}

const PY_KEYWORDS = new Set(['class', 'def', 'from', 'import', 'global', 'lambda', 'pass', 'return', 'yield', 'with', 'while', 'for', 'in', 'is', 'not', 'and', 'or', 'if', 'else', 'elif', 'try', 'except', 'finally', 'raise', 'del', 'as', 'assert', 'break', 'continue', 'async', 'await', 'None', 'True', 'False', 'nonlocal', 'type', 'id']);
const RUST_KEYWORDS = new Set(['type', 'match', 'ref', 'mod', 'move', 'impl', 'fn', 'use', 'struct', 'enum', 'trait', 'where', 'self', 'super', 'crate', 'loop', 'box', 'dyn', 'async', 'await', 'const', 'static', 'mut', 'pub', 'in', 'for', 'if', 'else', 'while', 'return', 'true', 'false', 'let', 'as', 'break', 'continue', 'extern', 'unsafe']);

const pydantic: Emitter = {
  header: () => 'from typing import Any, Optional, Union\n\nfrom pydantic import BaseModel, Field\n',
  prim: (n) => ({ string: 'str', number: 'float', boolean: 'bool', null: 'None', unknown: 'Any' })[n] ?? 'Any',
  array: (t) => `list[${t}]`,
  union: (p) => `Union[${p.join(', ')}]`,
  optional: (t) => `Optional[${t}]`,
  struct(name, fields) {
    const lines = fields.map((f) => {
      let id = snake(f.key);
      if (PY_KEYWORDS.has(id)) id += '_';
      const type = f.nullable || f.optional ? `Optional[${f.type}]` : f.type;
      const needsAlias = id !== f.key;
      const def = f.optional || f.nullable ? 'None' : undefined;
      if (needsAlias) return `    ${id}: ${type} = Field(${def ? `${def}, ` : ''}alias=${JSON.stringify(f.key)})`;
      return `    ${id}: ${type}${def ? ` = ${def}` : ''}`;
    });
    return `class ${name}(BaseModel):\n${lines.length ? lines.join('\n') : '    pass'}`;
  },
};

const INITIALISMS = new Set(['ID', 'URL', 'URI', 'API', 'HTTP', 'HTTPS', 'JSON', 'UUID', 'IP', 'SQL', 'HTML', 'CSS', 'XML', 'TTL']);

/** Go field name with standard initialisms: user_id → UserID, api_url → APIURL. */
function goIdent(key: string): string {
  const p = words(key)
    .map((w) => (INITIALISMS.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join('');
  if (!p) return 'Field';
  return /^[0-9]/.test(p) ? `F${p}` : p;
}

const goEm: Emitter = {
  header: () => 'package main\n',
  prim: (n) => ({ string: 'string', number: 'float64', boolean: 'bool', null: 'any', unknown: 'any' })[n] ?? 'any',
  array: (t) => `[]${t}`,
  union: () => 'any',
  optional: (t) => (t.startsWith('[]') || t === 'any' ? t : `*${t}`),
  struct(name, fields) {
    const rows = fields.map((f) => {
      const goName = goIdent(f.key);
      const type = f.optional || f.nullable ? goEm.optional(f.type) : f.type;
      return [goName, type, `\`json:"${f.key}${f.optional || f.nullable ? ',omitempty' : ''}"\``];
    });
    const w0 = Math.max(0, ...rows.map((r) => r[0].length));
    const w1 = Math.max(0, ...rows.map((r) => r[1].length));
    return `type ${name} struct {\n${rows.map((r) => `\t${r[0].padEnd(w0)} ${r[1].padEnd(w1)} ${r[2]}`).join('\n')}\n}`;
  },
};

const rust: Emitter = {
  header: () => 'use serde::{Deserialize, Serialize};\n',
  prim: (n) => ({ string: 'String', number: 'f64', boolean: 'bool', null: 'serde_json::Value', unknown: 'serde_json::Value' })[n] ?? 'serde_json::Value',
  array: (t) => `Vec<${t}>`,
  union: () => 'serde_json::Value',
  optional: (t) => `Option<${t}>`,
  struct(name, fields) {
    const lines = fields.map((f) => {
      let id = snake(f.key);
      const attrs: string[] = [];
      if (RUST_KEYWORDS.has(id)) id = `r#${id}`;
      if (id.replace(/^r#/, '') !== f.key) attrs.push(`rename = ${JSON.stringify(f.key)}`);
      const opt = f.optional || f.nullable;
      if (opt) attrs.push('skip_serializing_if = "Option::is_none"');
      const type = opt ? `Option<${f.type}>` : f.type;
      const attr = attrs.length ? `    #[serde(${attrs.join(', ')})]\n` : '';
      return `${attr}    pub ${id}: ${type},`;
    });
    return `#[derive(Debug, Clone, Serialize, Deserialize)]\npub struct ${name} {\n${lines.join('\n')}\n}`;
  },
};

const EMITTERS: Record<CodeLang, Emitter> = { pydantic, go: goEm, rust };

/** Numbers that are all integers become int / int64 / i64. */
function allIntegers(v: unknown, path: string[], out: Map<string, boolean>, at = ''): void {
  if (Array.isArray(v)) v.forEach((x) => allIntegers(x, path, out, at + '[]'));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) allIntegers(x, path, out, `${at}.${k}`);
  else if (typeof v === 'number') out.set(at, (out.get(at) ?? true) && Number.isInteger(v));
}

export function jsonToCode(value: unknown, lang: CodeLang, rootName = 'Root'): string {
  const em = EMITTERS[lang];
  const ints = new Map<string, boolean>();
  allIntegers(value, [], ints);
  const intType = { pydantic: 'int', go: 'int64', rust: 'i64' }[lang];
  const decls: string[] = [];
  const used = new Set<string>();
  const unique = (base: string) => {
    let n = pascal(base);
    let i = 2;
    while (used.has(n)) n = `${pascal(base)}${i++}`;
    used.add(n);
    return n;
  };

  const render = (s: Shape, hint: string, path: string): string => {
    const { inner, nullable } = unwrapNull(s);
    let t: string;
    switch (inner.kind) {
      case 'primitive':
        t = inner.name === 'number' && ints.get(path) ? intType : em.prim(inner.name);
        break;
      case 'array':
        t = em.array(render(inner.of, singular(hint), path + '[]'));
        break;
      case 'union':
        t = em.union(inner.of.map((m) => render(m, hint, path)));
        break;
      case 'object': {
        const name = unique(hint);
        const slot = decls.length;
        decls.push('');
        const fields = [...inner.fields].map(([key, f]) => {
          const u = unwrapNull(f.shape);
          return { key, type: render(u.inner, key, `${path}.${key}`), optional: f.optional, nullable: u.nullable };
        });
        decls[slot] = em.struct(name, fields);
        t = name;
        break;
      }
    }
    return nullable && s.kind !== 'object' && path === '' ? em.optional(t) : t;
  };

  const shape = infer(value);
  const top = render(shape, rootName, '');
  if (shape.kind !== 'object') {
    const alias = { pydantic: `${pascal(rootName)} = ${top}`, go: `type ${pascal(rootName)} ${top}`, rust: `pub type ${pascal(rootName)} = ${top};` }[lang];
    decls.unshift(alias);
  }
  // Python needs classes defined before they are referenced, so emit children first.
  const ordered = lang === 'pydantic' ? [...decls.filter((d) => d.startsWith('class ')).reverse(), ...decls.filter((d) => !d.startsWith('class '))] : decls;
  const sep = lang === 'pydantic' ? '\n\n\n' : '\n\n';
  return `${em.header()}\n${lang === 'pydantic' ? '\n' : ''}${ordered.join(sep)}\n`;
}
