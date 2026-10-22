// Repair "almost JSON" — typically LLM output — into valid JSON.
//
// Handles: markdown code fences and surrounding prose, comments, single or
// curly quotes, unquoted keys, trailing / missing commas, Python and JS
// literals (True, None, undefined, NaN), raw newlines inside strings and
// output that was truncated mid-way (closes open strings, arrays, objects).

export type Fix =
  | 'fence'
  | 'prose'
  | 'comment'
  | 'quotes'
  | 'unquoted-key'
  | 'trailing-comma'
  | 'missing-comma'
  | 'literal'
  | 'control-char'
  | 'truncated'
  | 'number'
  | 'missing-value';

export interface RepairResult {
  value: unknown;
  json: string;
  fixes: Fix[];
}

const OPEN_QUOTES: Record<string, string> = { '"': '"', "'": "'", '“': '”', '‘': '’', '`': '`' };

class Parser {
  i = 0;
  fixes = new Set<Fix>();
  private s: string;
  constructor(s: string) {
    this.s = s;
  }

  /** Current character (a method, so TypeScript doesn't narrow it across reads). */
  private peek(): string {
    return this.s[this.i];
  }
  private eof() {
    return this.i >= this.s.length;
  }

  ws() {
    for (;;) {
      while (!this.eof() && /\s/.test(this.peek())) this.i++;
      if (this.s.startsWith('//', this.i) || (this.peek() === '#' && this.allowHash)) {
        this.fixes.add('comment');
        while (!this.eof() && this.peek() !== '\n') this.i++;
      } else if (this.s.startsWith('/*', this.i)) {
        this.fixes.add('comment');
        const end = this.s.indexOf('*/', this.i + 2);
        this.i = end === -1 ? this.s.length : end + 2;
      } else return;
    }
  }
  allowHash = true;

  value(): unknown {
    this.ws();
    if (this.eof()) {
      this.fixes.add('truncated');
      return null;
    }
    const c = this.peek();
    if (c === '{') return this.object();
    if (c === '[') return this.array();
    if (c in OPEN_QUOTES) return this.string();
    if (/[-+0-9.]/.test(c)) return this.number();
    return this.word();
  }

  object(): Record<string, unknown> {
    this.i++; // {
    const out: Record<string, unknown> = {};
    let first = true;
    for (;;) {
      this.ws();
      if (this.eof()) {
        this.fixes.add('truncated');
        return out;
      }
      if (this.peek() === '}') {
        this.i++;
        return out;
      }
      if (this.peek() === ',') {
        this.i++;
        this.ws();
        if (this.peek() === '}' || this.eof()) {
          if (!this.eof()) this.fixes.add('trailing-comma');
          continue;
        }
        if (first) this.fixes.add('trailing-comma');
      } else if (!first) {
        this.fixes.add('missing-comma');
      }
      first = false;
      this.ws();
      if (this.peek() === '}' || this.eof()) continue;
      const key = this.key();
      this.ws();
      if (this.peek() === ':' || this.peek() === '=') this.i++;
      else this.fixes.add('missing-value');
      this.ws();
      if (this.eof() || this.peek() === '}' || this.peek() === ',') {
        this.fixes.add(this.eof() ? 'truncated' : 'missing-value');
        out[key] = null;
        continue;
      }
      out[key] = this.value();
    }
  }

  key(): string {
    if (this.peek() in OPEN_QUOTES) {
      if (this.peek() !== '"') this.fixes.add('quotes');
      return this.string() as string;
    }
    this.fixes.add('unquoted-key');
    const start = this.i;
    while (!this.eof() && !/[\s:=,}]/.test(this.peek())) this.i++;
    return this.s.slice(start, this.i);
  }

  array(): unknown[] {
    this.i++; // [
    const out: unknown[] = [];
    let first = true;
    for (;;) {
      this.ws();
      if (this.eof()) {
        this.fixes.add('truncated');
        return out;
      }
      if (this.peek() === ']') {
        this.i++;
        return out;
      }
      if (this.peek() === ',') {
        this.i++;
        this.ws();
        if (this.peek() === ']' || this.eof()) {
          if (!this.eof()) this.fixes.add('trailing-comma');
          continue;
        }
      } else if (!first) {
        this.fixes.add('missing-comma');
      }
      first = false;
      this.ws();
      if (this.peek() === ']' || this.eof()) continue;
      out.push(this.value());
    }
  }

  string(): string {
    const open = this.peek();
    const close = OPEN_QUOTES[open];
    if (open !== '"') this.fixes.add('quotes');
    this.i++;
    let out = '';
    while (!this.eof()) {
      const ch = this.peek();
      if (ch === '\\') {
        const n = this.s[this.i + 1];
        if (n === undefined) {
          this.i++;
          break;
        }
        const map: Record<string, string> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '/': '/', '\\': '\\', '"': '"', "'": "'" };
        if (n === 'u' && /^[0-9a-fA-F]{4}$/.test(this.s.slice(this.i + 2, this.i + 6))) {
          out += String.fromCharCode(parseInt(this.s.slice(this.i + 2, this.i + 6), 16));
          this.i += 6;
        } else {
          out += map[n] ?? n;
          this.i += 2;
        }
        continue;
      }
      if (ch === close) {
        // A straight double quote followed by something that can't follow a string
        // is probably an unescaped quote inside the text.
        if (close === '"' && !this.looksLikeStringEnd(this.i + 1)) {
          this.fixes.add('quotes');
          out += ch;
          this.i++;
          continue;
        }
        this.i++;
        return out;
      }
      if (ch === '\n' || ch === '\r' || ch === '\t') this.fixes.add('control-char');
      out += ch;
      this.i++;
    }
    this.fixes.add('truncated');
    return out;
  }

  private looksLikeStringEnd(j: number): boolean {
    while (j < this.s.length && (this.s[j] === ' ' || this.s[j] === '\t')) j++;
    if (j >= this.s.length) return true;
    const n = this.s[j];
    if (/[,:}\]\n\r]/.test(n)) return true;
    // `"a" "b"` style missing comma, or a comment
    return n === '"' || n === '/' || n === '#';
  }

  number(): number | null {
    const start = this.i;
    while (!this.eof() && /[-+0-9.eExXa-fA-F_]/.test(this.peek())) this.i++;
    const raw = this.s.slice(start, this.i);
    let clean = raw.replace(/_/g, '');
    if (/^[-+]?0x[0-9a-f]+$/i.test(clean)) {
      this.fixes.add('number');
      return parseInt(clean, 16);
    }
    if (clean.startsWith('+')) clean = clean.slice(1);
    if (/^-?\./.test(clean)) clean = clean.replace('.', '0.');
    if (/\.$/.test(clean)) clean += '0';
    const n = Number(clean);
    if (clean !== raw) this.fixes.add('number');
    if (Number.isNaN(n)) {
      this.fixes.add(raw === '-' || raw === '' ? 'truncated' : 'number');
      return null;
    }
    if (!/^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/.test(clean)) this.fixes.add('number');
    return n;
  }

  word(): unknown {
    const start = this.i;
    while (!this.eof() && /[A-Za-z_$0-9]/.test(this.peek())) this.i++;
    const w = this.s.slice(start, this.i);
    switch (w) {
      case 'true':
        return true;
      case 'false':
        return false;
      case 'null':
        return null;
      case 'True':
        this.fixes.add('literal');
        return true;
      case 'False':
        this.fixes.add('literal');
        return false;
      case 'None':
      case 'undefined':
      case 'NaN':
      case 'Infinity':
      case 'nil':
        this.fixes.add('literal');
        return null;
    }
    if (!w) {
      // Unknown character: skip it.
      this.i++;
      this.fixes.add('literal');
      return null;
    }
    // Partial literal at EOF: "tru", "nul" …
    if (this.eof()) {
      this.fixes.add('truncated');
      if ('true'.startsWith(w)) return true;
      if ('false'.startsWith(w)) return false;
      return null;
    }
    // Bare word: treat as a string.
    this.fixes.add('quotes');
    return w;
  }
}

/** Pull the JSON-looking part out of a chatty LLM reply. */
export function extractJson(text: string, fixes: Set<Fix>): string {
  let s = text.trim();
  const fence = /```[a-zA-Z0-9_-]*\s*\n?([\s\S]*?)(?:```|$)/.exec(s);
  if (fence && fence[1].trim()) {
    fixes.add('fence');
    s = fence[1].trim();
  }
  const first = s.search(/[{[]/);
  if (first > 0) {
    fixes.add('prose');
    s = s.slice(first);
  } else if (first === -1) {
    return s;
  }
  return s;
}

export function repairJson(text: string): RepairResult {
  const fixes = new Set<Fix>();
  const src = extractJson(text, fixes);
  // Fast path: already valid.
  try {
    const value = JSON.parse(src);
    return { value, json: JSON.stringify(value, null, 2), fixes: [...fixes] };
  } catch {
    /* repair below */
  }
  const p = new Parser(src);
  p.fixes = fixes;
  const value = p.value();
  p.ws();
  if (/\S/.test(src.slice(p.i)) && !fixes.has('prose')) {
    // Trailing text after the value (e.g. explanation) — drop it.
    fixes.add('prose');
  }
  return { value, json: JSON.stringify(value, null, 2), fixes: [...fixes] };
}
