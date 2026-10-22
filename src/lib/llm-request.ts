// Build chat requests for OpenAI-compatible and Anthropic APIs, and read non-streaming responses.
// Requests go straight from the browser to the provider the user chose.

export type ApiKind = 'openai' | 'anthropic';

export interface Preset {
  id: string;
  label: string;
  kind: ApiKind;
  baseUrl: string;
  model: string;
}

export const PRESETS: Preset[] = [
  { id: 'openai', label: 'OpenAI', kind: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-6-luna' },
  { id: 'anthropic', label: 'Anthropic', kind: 'anthropic', baseUrl: 'https://api.anthropic.com/v1', model: 'claude-haiku-5-5' },
  { id: 'deepseek', label: 'DeepSeek', kind: 'openai', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-flash' },
  { id: 'openrouter', label: 'OpenRouter', kind: 'openai', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-6-luna' },
  { id: 'ollama', label: 'Ollama (local)', kind: 'openai', baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' },
  { id: 'custom', label: 'Custom (OpenAI-compatible)', kind: 'openai', baseUrl: '', model: '' },
];

export interface ChatOptions {
  kind: ApiKind;
  baseUrl: string;
  apiKey: string;
  model: string;
  system?: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  /** Tool definitions in either OpenAI ({type:'function',function}) or Anthropic ({name,input_schema}) shape. */
  tools?: unknown[];
  /** JSON Schema for structured output (OpenAI response_format / Anthropic via a forced tool). */
  jsonSchema?: Record<string, unknown>;
}

export interface BuiltRequest {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

const trimSlash = (s: string) => s.replace(/\/+$/, '');

function toOpenAITool(t: unknown): unknown {
  const o = t as Record<string, unknown>;
  if (o && o.type === 'function') return o;
  if (o && typeof o.name === 'string') return { type: 'function', function: { name: o.name, description: o.description, parameters: o.input_schema ?? o.parameters ?? { type: 'object', properties: {} } } };
  return o;
}

function toAnthropicTool(t: unknown): unknown {
  const o = t as Record<string, unknown>;
  const f = (o && o.type === 'function' ? o.function : o) as Record<string, unknown>;
  return { name: f.name, description: f.description, input_schema: f.input_schema ?? f.parameters ?? { type: 'object', properties: {} } };
}

export function buildRequest(o: ChatOptions): BuiltRequest {
  if (!o.baseUrl) throw new Error('Base URL is required');
  if (!o.model) throw new Error('Model is required');
  if (o.kind === 'anthropic') {
    const body: Record<string, unknown> = {
      model: o.model,
      max_tokens: o.maxTokens ?? 1024,
      messages: [{ role: 'user', content: o.user }],
    };
    if (o.system) body.system = o.system;
    if (o.temperature !== undefined) body.temperature = o.temperature;
    if (o.stream) body.stream = true;
    const tools = (o.tools ?? []).map(toAnthropicTool);
    if (o.jsonSchema) {
      tools.push({ name: 'respond', description: 'Return the answer in this structure.', input_schema: o.jsonSchema });
      body.tool_choice = { type: 'tool', name: 'respond' };
    }
    if (tools.length) body.tools = tools;
    return {
      url: `${trimSlash(o.baseUrl)}/messages`,
      headers: {
        'content-type': 'application/json',
        'x-api-key': o.apiKey,
        'anthropic-version': '2023-06-01',
        // Required for calling the API directly from a browser.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body,
    };
  }
  const messages: unknown[] = [];
  if (o.system) messages.push({ role: 'system', content: o.system });
  messages.push({ role: 'user', content: o.user });
  const body: Record<string, unknown> = { model: o.model, messages };
  if (o.temperature !== undefined) body.temperature = o.temperature;
  if (o.maxTokens) body.max_tokens = o.maxTokens;
  if (o.stream) {
    body.stream = true;
    body.stream_options = { include_usage: true };
  }
  if (o.tools?.length) body.tools = o.tools.map(toOpenAITool);
  if (o.jsonSchema) body.response_format = { type: 'json_schema', json_schema: { name: 'response', strict: true, schema: o.jsonSchema } };
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (o.apiKey) headers.authorization = `Bearer ${o.apiKey}`;
  return { url: `${trimSlash(o.baseUrl)}/chat/completions`, headers, body };
}

/** curl equivalent with the key masked, for copying into a terminal or docs. */
export function toCurl(r: BuiltRequest, mask = true): string {
  const h = Object.entries(r.headers).map(([k, v]) => {
    const val = mask && /^(authorization|x-api-key)$/i.test(k) ? (k.toLowerCase() === 'authorization' ? 'Bearer $API_KEY' : '$API_KEY') : v;
    return `  -H "${k}: ${val}"`;
  });
  const body = JSON.stringify(r.body, null, 2).replace(/'/g, "'\\''");
  return [`curl ${r.url}`, ...h, `  -d '${body}'`].join(' \\\n');
}

export interface ParsedResponse {
  text: string;
  toolCalls: { name: string; arguments: string }[];
  usage?: Record<string, unknown>;
  finishReason?: string;
  model?: string;
}

/** Extract text, tool calls and usage from a non-streaming response. */
export function parseResponse(kind: ApiKind, data: unknown): ParsedResponse {
  const d = data as Record<string, any>;
  if (d?.error) throw new Error(typeof d.error === 'string' ? d.error : d.error.message ?? JSON.stringify(d.error));
  if (kind === 'anthropic') {
    const blocks: any[] = d.content ?? [];
    return {
      text: blocks.filter((b) => b.type === 'text').map((b) => b.text).join(''),
      toolCalls: blocks.filter((b) => b.type === 'tool_use').map((b) => ({ name: b.name, arguments: JSON.stringify(b.input, null, 2) })),
      usage: d.usage,
      finishReason: d.stop_reason,
      model: d.model,
    };
  }
  const choice = d.choices?.[0] ?? {};
  const msg = choice.message ?? {};
  return {
    text: typeof msg.content === 'string' ? msg.content : '',
    toolCalls: (msg.tool_calls ?? []).map((t: any) => ({ name: t.function?.name, arguments: t.function?.arguments ?? '' })),
    usage: d.usage,
    finishReason: choice.finish_reason,
    model: d.model,
  };
}
