// Encode tool state into a compact, URL-safe string for the # fragment (never sent to servers).

export type FieldState = Record<string, string | boolean>;

const toB64url = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = (s: string) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

/** JSON → deflate-raw → base64url. Prefixed with "z" so the format can evolve. */
export async function encodeState(state: FieldState): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(state));
  return 'z' + toB64url(await pipe(json, new CompressionStream('deflate-raw')));
}

export async function decodeState(s: string): Promise<FieldState> {
  if (!s.startsWith('z')) throw new Error('Unknown share format');
  const bytes = await pipe(fromB64url(s.slice(1)), new DecompressionStream('deflate-raw'));
  const data = JSON.parse(new TextDecoder().decode(bytes));
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid share data');
  return data as FieldState;
}
