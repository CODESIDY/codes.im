export interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; error: JsonError };

/** Convert a character offset into 1-based line/column. */
export function offsetToLineCol(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let last = -1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      last = i;
    }
  }
  return { line, column: offset - last };
}

export function parseJson(text: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    const message = (e as Error).message;
    // V8: "... in JSON at position 12 (line 2 column 3)" or "... at position 12"
    const lc = /line (\d+) column (\d+)/.exec(message);
    if (lc) return { ok: false, error: { message, line: +lc[1], column: +lc[2] } };
    const pos = /position (\d+)/.exec(message);
    if (pos) return { ok: false, error: { message, ...offsetToLineCol(text, +pos[1]) } };
    // Firefox: "JSON.parse: ... at line 2 column 3 of the JSON data"
    return { ok: false, error: { message } };
  }
}

export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as object)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => [k, sortKeysDeep((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

export function formatJson(value: unknown, indent: number | '\t', sortKeys = false): string {
  return JSON.stringify(sortKeys ? sortKeysDeep(value) : value, null, indent);
}
