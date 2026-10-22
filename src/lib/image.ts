// Pure helpers for the image tools (the actual encoding uses canvas in the browser).

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** Scale (w, h) down to fit within maxW × maxH, keeping aspect ratio. 0 / undefined means no limit. Never upscales. */
export function fitSize(w: number, h: number, maxW?: number, maxH?: number): { width: number; height: number } {
  let r = 1;
  if (maxW && w > maxW) r = Math.min(r, maxW / w);
  if (maxH && h > maxH) r = Math.min(r, maxH / h);
  return { width: Math.max(1, Math.round(w * r)), height: Math.max(1, Math.round(h * r)) };
}

/** Percentage saved going from `before` to `after` bytes (negative when the file grew). */
export const savedPercent = (before: number, after: number) => (before ? Math.round((1 - after / before) * 100) : 0);

export interface DataUri {
  mime: string;
  base64: boolean;
  data: string;
}

export function parseDataUri(s: string): DataUri {
  const m = /^data:([^;,]*)((?:;[^;,]*)*?)(;base64)?,(.*)$/s.exec(s.trim());
  if (!m) throw new Error('Not a data: URI');
  return { mime: m[1] || 'text/plain', base64: !!m[3], data: m[4] };
}

/** Bytes represented by a base64 string (ignoring whitespace). */
export function base64Size(b64: string): number {
  const s = b64.replace(/\s/g, '');
  const pad = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0;
  return Math.floor((s.length * 3) / 4) - pad;
}

export type SnippetKind = 'uri' | 'base64' | 'html' | 'css' | 'markdown' | 'json';

export function snippet(kind: SnippetKind, dataUri: string, alt = 'image'): string {
  const b64 = dataUri.slice(dataUri.indexOf(',') + 1);
  switch (kind) {
    case 'uri':
      return dataUri;
    case 'base64':
      return b64;
    case 'html':
      return `<img src="${dataUri}" alt="${alt.replace(/"/g, '&quot;')}" />`;
    case 'css':
      return `background-image: url("${dataUri}");`;
    case 'markdown':
      return `![${alt.replace(/[[\]]/g, '')}](${dataUri})`;
    case 'json': {
      // OpenAI / Anthropic style image content part.
      const { mime } = parseDataUri(dataUri);
      return JSON.stringify({ type: 'image', source: { type: 'base64', media_type: mime, data: b64 } }, null, 2);
    }
  }
}
