// Arbitrary-precision number base conversion (2–36) with BigInt.

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Parse an integer in `base`. Accepts 0x / 0o / 0b prefixes, `_` and spaces as separators, and a leading minus. */
export function parseBigInt(input: string, base: number): bigint {
  let s = input.trim().toLowerCase().replace(/[\s_,]/g, '');
  if (!s) throw new Error('Empty input');
  let neg = false;
  if (s[0] === '-' || s[0] === '+') {
    neg = s[0] === '-';
    s = s.slice(1);
  }
  const prefix: Record<string, number> = { '0x': 16, '0o': 8, '0b': 2 };
  const p = s.slice(0, 2);
  if (prefix[p] && prefix[p] === base) s = s.slice(2);
  if (!s) throw new Error('Empty input');
  let n = 0n;
  const b = BigInt(base);
  for (const c of s) {
    const d = DIGITS.indexOf(c);
    if (d < 0 || d >= base) throw new Error(`"${c}" is not a valid base-${base} digit`);
    n = n * b + BigInt(d);
  }
  return neg ? -n : n;
}

export function toBase(n: bigint, base: number): string {
  if (n === 0n) return '0';
  const neg = n < 0n;
  let v = neg ? -n : n;
  const b = BigInt(base);
  let out = '';
  while (v > 0n) {
    out = DIGITS[Number(v % b)] + out;
    v /= b;
  }
  return (neg ? '-' : '') + out;
}

/** Group digits from the right, e.g. 4 for binary/hex, 3 for decimal. */
export function group(s: string, size: number, sep = ' '): string {
  const neg = s.startsWith('-');
  const body = neg ? s.slice(1) : s;
  const parts: string[] = [];
  for (let i = body.length; i > 0; i -= size) parts.unshift(body.slice(Math.max(0, i - size), i));
  return (neg ? '-' : '') + parts.join(sep);
}

export function bitLength(n: bigint): number {
  const v = n < 0n ? -n : n;
  return v === 0n ? 0 : v.toString(2).length;
}

/** Two's-complement representation of a (possibly negative) number in `bits` bits. */
export function twosComplement(n: bigint, bits: number): string | null {
  const min = -(1n << BigInt(bits - 1));
  const max = (1n << BigInt(bits)) - 1n;
  if (n < min || n > max) return null;
  const v = n < 0n ? (1n << BigInt(bits)) + n : n;
  return v.toString(2).padStart(bits, '0');
}
