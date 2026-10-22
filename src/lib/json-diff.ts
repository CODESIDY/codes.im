// Structural JSON diff: compares two parsed JSON values key by key.

export type ChangeKind = 'added' | 'removed' | 'changed';
export interface Change {
  kind: ChangeKind;
  /** JSONPath-style location, e.g. $.items[2].price */
  path: string;
  before?: unknown;
  after?: unknown;
}

export interface DiffOptions {
  /** Treat arrays as unordered sets of primitives / objects (compared by value). */
  ignoreArrayOrder?: boolean;
  /** Treat 1 and 1.0, "1" and 1 as different? Numbers vs strings are always different; this compares numbers with a tolerance. */
  epsilon?: number;
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? `.${k}` : `[${JSON.stringify(k)}]`);

function stable(x: unknown): string {
  if (Array.isArray(x)) return '[' + x.map(stable).join(',') + ']';
  if (isObj(x))
    return (
      '{' +
      Object.keys(x)
        .sort()
        .map((k) => JSON.stringify(k) + ':' + stable(x[k]))
        .join(',') +
      '}'
    );
  return JSON.stringify(x);
}

export function diffJson(a: unknown, b: unknown, opts: DiffOptions = {}, path = '$', out: Change[] = []): Change[] {
  if (isObj(a) && isObj(b)) {
    for (const k of Object.keys(a)) {
      if (!Object.hasOwn(b, k)) out.push({ kind: 'removed', path: path + key(k), before: a[k] });
      else diffJson(a[k], b[k], opts, path + key(k), out);
    }
    for (const k of Object.keys(b)) if (!Object.hasOwn(a, k)) out.push({ kind: 'added', path: path + key(k), after: b[k] });
    return out;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (opts.ignoreArrayOrder) {
      const count = new Map<string, number>();
      for (const x of b) count.set(stable(x), (count.get(stable(x)) ?? 0) + 1);
      const removed: unknown[] = [];
      for (const x of a) {
        const s = stable(x);
        const c = count.get(s) ?? 0;
        if (c > 0) count.set(s, c - 1);
        else removed.push(x);
      }
      const left = new Map<string, number>();
      for (const x of a) left.set(stable(x), (left.get(stable(x)) ?? 0) + 1);
      for (const x of removed) out.push({ kind: 'removed', path: `${path}[*]`, before: x });
      for (const x of b) {
        const s = stable(x);
        const c = left.get(s) ?? 0;
        if (c > 0) left.set(s, c - 1);
        else out.push({ kind: 'added', path: `${path}[*]`, after: x });
      }
      return out;
    }
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (i >= a.length) out.push({ kind: 'added', path: `${path}[${i}]`, after: b[i] });
      else if (i >= b.length) out.push({ kind: 'removed', path: `${path}[${i}]`, before: a[i] });
      else diffJson(a[i], b[i], opts, `${path}[${i}]`, out);
    }
    return out;
  }
  if (typeof a === 'number' && typeof b === 'number' && opts.epsilon) {
    if (Math.abs(a - b) > opts.epsilon) out.push({ kind: 'changed', path, before: a, after: b });
    return out;
  }
  if (stable(a) !== stable(b)) out.push({ kind: 'changed', path, before: a, after: b });
  return out;
}

export function summarize(changes: Change[]) {
  return {
    added: changes.filter((c) => c.kind === 'added').length,
    removed: changes.filter((c) => c.kind === 'removed').length,
    changed: changes.filter((c) => c.kind === 'changed').length,
  };
}

/** Deterministic, key-sorted pretty JSON — useful for a text diff that ignores key order. */
export function canonical(x: unknown, indent = 2): string {
  const sort = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(sort) : isObj(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort(v[k])])) : v;
  return JSON.stringify(sort(x), null, indent);
}
