// Reassemble streamed LLM responses (Server-Sent Events / NDJSON) into the
// final message. Supports OpenAI Chat Completions, OpenAI Responses API,
// Anthropic Messages, Google Gemini and Ollama formats.

export type Provider = 'openai-chat' | 'openai-responses' | 'anthropic' | 'gemini' | 'ollama' | 'unknown';

export interface ToolCall {
  id?: string;
  name: string;
  arguments: string;
}

export interface StreamResult {
  provider: Provider;
  model?: string;
  text: string;
  reasoning: string;
  toolCalls: ToolCall[];
  finishReason?: string;
  usage?: Record<string, unknown>;
  events: number;
  /** Lines that could not be parsed as JSON. */
  badLines: number;
  errors: string[];
}

interface RawEvent {
  event?: string;
  data: string;
}

export function splitEvents(raw: string): RawEvent[] {
  const out: RawEvent[] = [];
  let event: string | undefined;
  for (const line of raw.split(/\r?\n/)) {
    const l = line.trim();
    if (!l) {
      event = undefined;
      continue;
    }
    if (l.startsWith(':')) continue; // SSE comment / keep-alive
    if (l.startsWith('event:')) {
      event = l.slice(6).trim();
      continue;
    }
    if (l.startsWith('data:')) {
      out.push({ event, data: l.slice(5).trim() });
      continue;
    }
    if (l.startsWith('{')) out.push({ data: l }); // NDJSON
  }
  return out;
}

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function detect(o: Json): Provider {
  if (o.object === 'chat.completion.chunk' || (Array.isArray(o.choices) && o.choices[0]?.delta !== undefined)) return 'openai-chat';
  if (typeof o.type === 'string' && o.type.startsWith('response.')) return 'openai-responses';
  if (typeof o.type === 'string' && /^(message_|content_block_|ping$|error$)/.test(o.type)) return 'anthropic';
  if (Array.isArray(o.candidates) || o.usageMetadata) return 'gemini';
  if ('done' in o && ('message' in o || 'response' in o)) return 'ollama';
  return 'unknown';
}

export function parseStream(raw: string): StreamResult {
  const r: StreamResult = { provider: 'unknown', text: '', reasoning: '', toolCalls: [], events: 0, badLines: 0, errors: [] };
  const chatTools = new Map<number, ToolCall>();
  const blocks = new Map<number, ToolCall | null>(); // anthropic content blocks: tool_use or null
  const respTools = new Map<string, ToolCall>();

  for (const ev of splitEvents(raw)) {
    if (ev.data === '[DONE]') continue;
    let o: Json;
    try {
      o = JSON.parse(ev.data);
    } catch {
      r.badLines++;
      continue;
    }
    r.events++;
    const p = detect(o);
    if (r.provider === 'unknown' && p !== 'unknown') r.provider = p;

    if (o.error) r.errors.push(typeof o.error === 'string' ? o.error : o.error.message ?? JSON.stringify(o.error));

    // Some chunks (e.g. OpenAI's final usage-only chunk with empty `choices`) are ambiguous on their own;
    // treat them as coming from the provider already detected.
    switch (p === 'unknown' ? r.provider : p) {
      case 'openai-chat': {
        r.model ??= o.model;
        if (o.usage) r.usage = o.usage;
        const c = o.choices?.[0];
        if (!c) break;
        const d = c.delta ?? {};
        if (typeof d.content === 'string') r.text += d.content;
        if (typeof d.reasoning_content === 'string') r.reasoning += d.reasoning_content; // DeepSeek, Qwen…
        if (typeof d.reasoning === 'string') r.reasoning += d.reasoning;
        for (const tc of d.tool_calls ?? []) {
          const i = tc.index ?? 0;
          const cur = chatTools.get(i) ?? { name: '', arguments: '' };
          if (tc.id) cur.id = tc.id;
          if (tc.function?.name) cur.name += tc.function.name;
          if (tc.function?.arguments) cur.arguments += tc.function.arguments;
          chatTools.set(i, cur);
        }
        if (c.finish_reason) r.finishReason = c.finish_reason;
        break;
      }
      case 'openai-responses': {
        switch (o.type) {
          case 'response.created':
            r.model ??= o.response?.model;
            break;
          case 'response.output_text.delta':
            r.text += o.delta ?? '';
            break;
          case 'response.reasoning_summary_text.delta':
          case 'response.reasoning_text.delta':
            r.reasoning += o.delta ?? '';
            break;
          case 'response.output_item.added':
            if (o.item?.type === 'function_call') {
              respTools.set(o.item.id, { id: o.item.call_id, name: o.item.name ?? '', arguments: '' });
            }
            break;
          case 'response.function_call_arguments.delta': {
            const t = respTools.get(o.item_id);
            if (t) t.arguments += o.delta ?? '';
            break;
          }
          case 'response.completed':
          case 'response.incomplete':
            r.usage = o.response?.usage;
            r.finishReason = o.response?.status;
            r.model ??= o.response?.model;
            break;
        }
        break;
      }
      case 'anthropic': {
        switch (o.type) {
          case 'message_start':
            r.model = o.message?.model;
            r.usage = { ...(o.message?.usage ?? {}) };
            break;
          case 'content_block_start': {
            const b = o.content_block ?? {};
            if (b.type === 'tool_use' || b.type === 'server_tool_use') {
              blocks.set(o.index, { id: b.id, name: b.name, arguments: '' });
            } else blocks.set(o.index, null);
            if (b.type === 'text' && b.text) r.text += b.text;
            break;
          }
          case 'content_block_delta': {
            const d = o.delta ?? {};
            if (d.type === 'text_delta') r.text += d.text ?? '';
            else if (d.type === 'thinking_delta') r.reasoning += d.thinking ?? '';
            else if (d.type === 'input_json_delta') {
              const t = blocks.get(o.index);
              if (t) t.arguments += d.partial_json ?? '';
            }
            break;
          }
          case 'message_delta':
            if (o.delta?.stop_reason) r.finishReason = o.delta.stop_reason;
            if (o.usage) r.usage = { ...(r.usage ?? {}), ...o.usage };
            break;
        }
        break;
      }
      case 'gemini': {
        r.model ??= o.modelVersion;
        const c = o.candidates?.[0];
        for (const part of c?.content?.parts ?? []) {
          if (typeof part.text === 'string') {
            if (part.thought) r.reasoning += part.text;
            else r.text += part.text;
          }
          if (part.functionCall) {
            r.toolCalls.push({ name: part.functionCall.name, arguments: JSON.stringify(part.functionCall.args ?? {}) });
          }
        }
        if (c?.finishReason) r.finishReason = c.finishReason;
        if (o.usageMetadata) r.usage = o.usageMetadata;
        break;
      }
      case 'ollama': {
        r.model ??= o.model;
        r.text += o.message?.content ?? o.response ?? '';
        if (o.message?.thinking) r.reasoning += o.message.thinking;
        for (const tc of o.message?.tool_calls ?? []) {
          r.toolCalls.push({ name: tc.function?.name ?? '', arguments: JSON.stringify(tc.function?.arguments ?? {}) });
        }
        if (o.done) {
          r.finishReason = o.done_reason ?? 'stop';
          r.usage = { prompt_eval_count: o.prompt_eval_count, eval_count: o.eval_count };
        }
        break;
      }
    }
  }

  r.toolCalls.unshift(...chatTools.values(), ...respTools.values(), ...[...blocks.values()].filter((b): b is ToolCall => !!b));
  return r;
}
