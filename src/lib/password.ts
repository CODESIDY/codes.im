// Cryptographically secure passwords and tokens.

export const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/~',
};
const AMBIGUOUS = /[Il1O0o|`'"]/g;

export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

/** Unbiased random integer in [0, max) using rejection sampling. */
export function randomInt(max: number): number {
  if (max <= 0) throw new Error('max must be positive');
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

export function generatePassword(o: PasswordOptions): string {
  const pools = (['lower', 'upper', 'digits', 'symbols'] as const)
    .filter((k) => o[k])
    .map((k) => (o.excludeAmbiguous ? SETS[k].replace(AMBIGUOUS, '') : SETS[k]));
  if (!pools.length) throw new Error('Select at least one character set');
  const all = pools.join('');
  const len = Math.max(pools.length, o.length);
  // Guarantee at least one character from each selected set, then shuffle.
  const chars = pools.map((p) => p[randomInt(p.length)]);
  while (chars.length < len) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function poolSize(o: PasswordOptions): number {
  return (['lower', 'upper', 'digits', 'symbols'] as const)
    .filter((k) => o[k])
    .reduce((n, k) => n + (o.excludeAmbiguous ? SETS[k].replace(AMBIGUOUS, '') : SETS[k]).length, 0);
}

/** Entropy in bits for a random string of `length` drawn from `pool` symbols. */
export const entropyBits = (length: number, pool: number) => (pool > 1 ? length * Math.log2(pool) : 0);

export function strengthLabel(bits: number): 'weak' | 'fair' | 'strong' | 'very-strong' {
  if (bits < 50) return 'weak';
  if (bits < 70) return 'fair';
  if (bits < 100) return 'strong';
  return 'very-strong';
}

export type TokenFormat = 'hex' | 'base64url' | 'base62';

export function generateToken(bytes: number, format: TokenFormat): string {
  if (format === 'base62') {
    const alphabet = SETS.digits + SETS.upper + SETS.lower;
    // ceil(bytes * 8 / log2(62)) characters give at least `bytes` of entropy.
    const n = Math.ceil((bytes * 8) / Math.log2(62));
    return Array.from({ length: n }, () => alphabet[randomInt(62)]).join('');
  }
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  if (format === 'hex') return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  let bin = '';
  for (const x of b) bin += String.fromCharCode(x);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
