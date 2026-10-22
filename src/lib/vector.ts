// Vector similarity helpers for comparing embeddings.

/**
 * Parse a vector from a JSON array, an OpenAI/Gemini-style embedding response,
 * or numbers separated by commas, spaces or newlines.
 */
export function parseVector(input: string): number[] {
  const s = input.trim();
  if (!s) throw new Error('Empty vector');
  let nums: unknown;
  let data: unknown = undefined;
  if (s.startsWith('[') || s.startsWith('{')) {
    try {
      data = JSON.parse(s);
    } catch {
      // "[0.1 0.2]" (NumPy style) is not JSON — fall through to plain splitting.
      if (s.startsWith('{')) throw new Error('Invalid JSON');
    }
  }
  if (data !== undefined) {
    nums = findNumberArray(data);
    if (!nums) throw new Error('No numeric array found in JSON');
  } else {
    nums = s
      .replace(/^\[|\]$/g, '')
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map((x) => {
        const n = Number(x);
        if (!Number.isFinite(n)) throw new Error(`"${x}" is not a number`);
        return n;
      });
  }
  const v = nums as number[];
  if (!v.length) throw new Error('Empty vector');
  return v;
}

/** Find the first array of numbers in a JSON value (depth-first), e.g. data[0].embedding or embedding.values. */
function findNumberArray(x: unknown, depth = 0): number[] | null {
  if (depth > 6) return null;
  if (Array.isArray(x)) {
    if (x.length && x.every((n) => typeof n === 'number' && Number.isFinite(n))) return x as number[];
    for (const item of x) {
      const r = findNumberArray(item, depth + 1);
      if (r) return r;
    }
    return null;
  }
  if (x && typeof x === 'object') {
    for (const v of Object.values(x)) {
      const r = findNumberArray(v, depth + 1);
      if (r) return r;
    }
  }
  return null;
}

function same(a: number[], b: number[]) {
  if (a.length !== b.length) throw new Error(`Dimension mismatch: ${a.length} vs ${b.length}`);
}

export const dot = (a: number[], b: number[]) => {
  same(a, b);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};

export const norm = (a: number[]) => Math.sqrt(a.reduce((s, x) => s + x * x, 0));

export function cosine(a: number[], b: number[]): number {
  const d = dot(a, b);
  const n = norm(a) * norm(b);
  if (n === 0) throw new Error('Cosine similarity is undefined for a zero vector');
  return d / n;
}

export function euclidean(a: number[], b: number[]): number {
  same(a, b);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

export function manhattan(a: number[], b: number[]): number {
  same(a, b);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s;
}

export function normalize(a: number[]): number[] {
  const n = norm(a);
  if (n === 0) throw new Error('Cannot normalize a zero vector');
  return a.map((x) => x / n);
}

export interface Comparison {
  dims: number;
  cosine: number;
  /** Cosine distance = 1 − cosine similarity. */
  cosineDistance: number;
  /** Angle between the vectors in degrees. */
  angle: number;
  dot: number;
  euclidean: number;
  manhattan: number;
  normA: number;
  normB: number;
}

export function compare(a: number[], b: number[]): Comparison {
  const c = cosine(a, b);
  return {
    dims: a.length,
    cosine: c,
    cosineDistance: 1 - c,
    angle: (Math.acos(Math.min(1, Math.max(-1, c))) * 180) / Math.PI,
    dot: dot(a, b),
    euclidean: euclidean(a, b),
    manhattan: manhattan(a, b),
    normA: norm(a),
    normB: norm(b),
  };
}
