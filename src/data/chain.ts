// Tool chaining: which element holds each tool's result, and which tools can receive which kind of data.
// The receiving tool is opened with its input prefilled through the same #s= state used by share links.

export type PayloadType = 'json' | 'badjson' | 'jwt' | 'curl' | 'sse' | 'sql' | 'text';

/** Where to read a tool's result from (textarea/input value or element text). */
export const chainOutputs: Record<string, string> = {
  'json-formatter': '#jf-out',
  'json-repair': '#jr-out',
  'json-schema-generator': '#js-out',
  'json-to-typescript': '#jt-out',
  'json-to-zod': '#zd-out',
  'json-to-code': '#jc-out',
  'json-path': '#jp-out',
  'csv-json': '#cj-out',
  'yaml-json': '#yj-out',
  'sql-formatter': '#sqlf-out',
  'curl-converter': '#curl-out',
  base64: '#b64-out',
  'url-encoder': '#url-out',
  'text-escape': '#te-out',
  'markdown-cleaner': '#mdc-out',
  'markdown-editor': '#mde-in',
  'chat-format-converter': '#cf-out',
  'openapi-to-tools': '#oa-out',
  'uuid-generator': '#uuid-out',
  'password-generator': '#pw-all',
  'fake-data-generator': '#fd-out',
  'llm-stream-parser': '#sse-text',
  'llm-api-playground': '#lp-out',
  'prompt-template': '#pt-out',
  'llms-txt-generator': '#lt-out',
  'mcp-config-generator': '#mcp-out',
  'jwt-decoder': '#jwt-payload',
  'word-counter': '#wc-in',
};

export interface ChainTarget {
  slug: string;
  accepts: PayloadType[];
  /** State applied to the target tool (keys as in share links: "#id" or "radioName=value"). `$` is replaced by the payload. */
  state: Record<string, string | boolean>;
}

export const chainTargets: ChainTarget[] = [
  { slug: 'json-formatter', accepts: ['json'], state: { '#jf-in': '$' } },
  { slug: 'json-repair', accepts: ['badjson'], state: { '#jr-in': '$' } },
  { slug: 'json-path', accepts: ['json'], state: { '#jp-json': '$' } },
  { slug: 'json-to-typescript', accepts: ['json'], state: { '#jt-in': '$' } },
  { slug: 'json-to-zod', accepts: ['json'], state: { '#zd-in': '$' } },
  { slug: 'json-schema-generator', accepts: ['json'], state: { '#js-in': '$' } },
  { slug: 'json-to-code', accepts: ['json'], state: { '#jc-in': '$' } },
  { slug: 'yaml-json', accepts: ['json'], state: { 'yj-dir=j2y': true, '#yj-in': '$' } },
  { slug: 'csv-json', accepts: ['json'], state: { 'cj-dir=j2c': true, '#cj-in': '$' } },
  { slug: 'json-diff', accepts: ['json'], state: { '#jd-a': '$' } },
  { slug: 'jwt-decoder', accepts: ['jwt'], state: { '#jwt-in': '$' } },
  { slug: 'curl-converter', accepts: ['curl'], state: { '#curl-in': '$' } },
  { slug: 'llm-stream-parser', accepts: ['sse'], state: { '#sse-in': '$' } },
  { slug: 'sql-formatter', accepts: ['sql'], state: { '#sqlf-in': '$' } },
  { slug: 'token-counter', accepts: ['text', 'json'], state: { '#tk-in': '$' } },
  { slug: 'word-counter', accepts: ['text'], state: { '#wc-in': '$' } },
  { slug: 'text-chunker', accepts: ['text'], state: { '#ck-in': '$' } },
  { slug: 'markdown-cleaner', accepts: ['text'], state: { '#mdc-in': '$' } },
  { slug: 'markdown-editor', accepts: ['text'], state: { '#mde-in': '$' } },
  { slug: 'text-diff', accepts: ['text', 'json'], state: { '#diff-a': '$' } },
  { slug: 'regex-tester', accepts: ['text'], state: { '#rx-text': '$' } },
  { slug: 'base64', accepts: ['text', 'json', 'jwt'], state: { 'b64-mode=encode': true, '#b64-in': '$' } },
  { slug: 'url-encoder', accepts: ['text', 'json'], state: { 'url-mode=encode': true, '#url-in': '$' } },
  { slug: 'hash-generator', accepts: ['text', 'json'], state: { '#hash-in': '$' } },
  { slug: 'qr-code-generator', accepts: ['text'], state: { '#qr-text': '$' } },
  { slug: 'case-converter', accepts: ['text'], state: { '#cc-in': '$' } },
];

/** Classify a payload so only sensible targets are offered. */
export function detectPayload(v: string): PayloadType[] {
  const s = v.trim();
  if (!s) return [];
  if (/^eyJ[\w-]*\.eyJ[\w-]*\.[\w-]*$/.test(s)) return ['jwt', 'text'];
  if (/^curl\s/i.test(s)) return ['curl', 'text'];
  if (/^(event|data):/m.test(s) && /^data:/m.test(s)) return ['sse', 'text'];
  if (/^[[{]/.test(s)) {
    try {
      JSON.parse(s);
      return ['json'];
    } catch {
      return ['badjson', 'text'];
    }
  }
  if (/^(select|insert|update|delete|create|alter|with)\b/i.test(s)) return ['sql', 'text'];
  return ['text'];
}

/** Targets that accept this payload, most specific first, excluding the current tool. */
export function targetsFor(from: string, types: PayloadType[]): ChainTarget[] {
  const rank = (t: ChainTarget) => {
    const primary = types.indexOf(t.accepts[0]);
    if (primary >= 0) return primary;
    const other = t.accepts.map((a) => types.indexOf(a)).filter((i) => i >= 0);
    return other.length ? 10 + Math.min(...other) : -1;
  };
  return chainTargets
    .filter((t) => t.slug !== from && rank(t) >= 0)
    .map((t, i) => ({ t, r: rank(t), i }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.t);
}

export function targetState(t: ChainTarget, payload: string): Record<string, string | boolean> {
  return Object.fromEntries(Object.entries(t.state).map(([k, v]) => [k, v === '$' ? payload : v]));
}
