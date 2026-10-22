// UTF-8 safe Base64 / Base64URL helpers (no dependencies, works in browsers and Node 18+).

export function bytesToBase64(bytes: Uint8Array, urlSafe = false): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const b64 = btoa(bin);
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

export function base64ToBytes(input: string): Uint8Array {
  let s = input.trim().replace(/\s+/g, '');
  // Accept data URIs.
  const comma = s.indexOf(',');
  if (s.startsWith('data:') && comma !== -1) s = s.slice(comma + 1);
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) throw new Error('Invalid Base64 characters');
  const pad = s.length % 4;
  if (pad === 1) throw new Error('Invalid Base64 length');
  if (pad) s += '='.repeat(4 - pad);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeBase64(text: string, urlSafe = false): string {
  return bytesToBase64(new TextEncoder().encode(text), urlSafe);
}

export function decodeBase64(b64: string): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(b64));
}

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export function decodeJwt(token: string): DecodedJwt {
  const t = token.trim().replace(/^Bearer\s+/i, '');
  const parts = t.split('.');
  if (parts.length !== 3) throw new Error(`A JWT has 3 parts separated by dots; found ${parts.length}.`);
  const part = (s: string, label: string) => {
    try {
      return JSON.parse(decodeBase64(s));
    } catch {
      throw new Error(`The ${label} is not valid Base64URL-encoded JSON.`);
    }
  };
  return { header: part(parts[0], 'header'), payload: part(parts[1], 'payload'), signature: parts[2] };
}
