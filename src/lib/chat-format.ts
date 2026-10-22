// Convert chat histories between OpenAI Chat Completions, Anthropic Messages
// and Google Gemini request formats, including images and tool calls.

export type ChatFormat = 'openai' | 'anthropic' | 'gemini';

type Part =
  | { type: 'text'; text: string }
  | { type: 'image'; url?: string; data?: string; mediaType?: string }
  | { type: 'tool_call'; id: string; name: string; args: unknown }
  | { type: 'tool_result'; id: string; name?: string; content: string; isError?: boolean };

interface Turn {
  role: 'user' | 'assistant';
  parts: Part[];
}

export interface Conversation {
  system: string;
  turns: Turn[];
}

type J = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// ------------------------------------------------------------------ detect

export function detectFormat(input: unknown): ChatFormat {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const o = input as J;
    if (Array.isArray(o.contents) || o.systemInstruction) return 'gemini';
    if (o.system !== undefined) return 'anthropic';
    if (Array.isArray(o.messages)) return detectFormat(o.messages);
  }
  if (Array.isArray(input)) {
    for (const m of input as J[]) {
      if (!m || typeof m !== 'object') continue;
      if (Array.isArray(m.parts)) return 'gemini';
      if (m.role === 'system' || m.role === 'developer' || m.role === 'tool' || m.tool_calls) return 'openai';
      if (Array.isArray(m.content)) {
        for (const b of m.content) {
          if (['tool_use', 'tool_result', 'image'].includes(b?.type) && !b.image_url) return 'anthropic';
          if (b?.type === 'image_url') return 'openai';
        }
      }
    }
  }
  return 'openai';
}

// ------------------------------------------------------------------ parse

const text = (t: string): Part => ({ type: 'text', text: t });

function dataUrl(url: string): { data: string; mediaType: string } | null {
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(url);
  return m ? { mediaType: m[1], data: m[2] } : null;
}

function parseOpenAI(input: unknown): Conversation {
  const msgs = (Array.isArray(input) ? input : (input as J).messages ?? []) as J[];
  const conv: Conversation = { system: '', turns: [] };
  const names = new Map<string, string>();
  for (const m of msgs) {
    const parts: Part[] = [];
    const content = m.content;
    if (typeof content === 'string' && content) parts.push(text(content));
    else if (Array.isArray(content)) {
      for (const c of content) {
        if (c.type === 'text') parts.push(text(c.text));
        else if (c.type === 'image_url') {
          const url = typeof c.image_url === 'string' ? c.image_url : c.image_url?.url;
          const d = dataUrl(url ?? '');
          parts.push(d ? { type: 'image', ...d } : { type: 'image', url });
        }
      }
    }
    if (m.role === 'system' || m.role === 'developer') {
      conv.system += (conv.system ? '\n\n' : '') + parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
      continue;
    }
    if (m.role === 'tool' || m.role === 'function') {
      const id = m.tool_call_id ?? m.name ?? '';
      const body = typeof content === 'string' ? content : parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
      conv.turns.push({ role: 'user', parts: [{ type: 'tool_result', id, name: names.get(id) ?? m.name, content: body }] });
      continue;
    }
    for (const tc of m.tool_calls ?? []) {
      let args: unknown = {};
      try {
        args = JSON.parse(tc.function?.arguments || '{}');
      } catch {
        args = tc.function?.arguments;
      }
      names.set(tc.id, tc.function?.name);
      parts.push({ type: 'tool_call', id: tc.id, name: tc.function?.name, args });
    }
    conv.turns.push({ role: m.role === 'assistant' ? 'assistant' : 'user', parts });
  }
  return conv;
}

function blocksToText(c: unknown): string {
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) return c.map((b: J) => (b.type === 'text' ? b.text : '')).join('');
  return '';
}

function parseAnthropic(input: unknown): Conversation {
  const o = (Array.isArray(input) ? { messages: input } : input) as J;
  const conv: Conversation = { system: blocksToText(o.system ?? ''), turns: [] };
  for (const m of (o.messages ?? []) as J[]) {
    const parts: Part[] = [];
    const blocks = typeof m.content === 'string' ? [{ type: 'text', text: m.content }] : (m.content ?? []);
    for (const b of blocks as J[]) {
      if (b.type === 'text') parts.push(text(b.text));
      else if (b.type === 'image') {
        const s = b.source ?? {};
        parts.push(s.type === 'base64' ? { type: 'image', data: s.data, mediaType: s.media_type } : { type: 'image', url: s.url });
      } else if (b.type === 'tool_use') parts.push({ type: 'tool_call', id: b.id, name: b.name, args: b.input ?? {} });
      else if (b.type === 'tool_result') {
        parts.push({ type: 'tool_result', id: b.tool_use_id, content: blocksToText(b.content ?? ''), isError: b.is_error });
      }
    }
    conv.turns.push({ role: m.role === 'assistant' ? 'assistant' : 'user', parts });
  }
  // Fill tool names for results.
  const names = new Map<string, string>();
  for (const t of conv.turns) for (const p of t.parts) if (p.type === 'tool_call') names.set(p.id, p.name);
  for (const t of conv.turns) for (const p of t.parts) if (p.type === 'tool_result') p.name = names.get(p.id);
  return conv;
}

function parseGemini(input: unknown): Conversation {
  const o = (Array.isArray(input) ? { contents: input } : input) as J;
  const sys = o.systemInstruction ?? o.system_instruction;
  const conv: Conversation = { system: (sys?.parts ?? []).map((p: J) => p.text ?? '').join(''), turns: [] };
  let n = 0;
  const idFor = new Map<string, string[]>();
  for (const c of (o.contents ?? []) as J[]) {
    const parts: Part[] = [];
    for (const p of (c.parts ?? []) as J[]) {
      if (typeof p.text === 'string' && !p.thought) parts.push(text(p.text));
      else if (p.inlineData ?? p.inline_data) {
        const d = p.inlineData ?? p.inline_data;
        parts.push({ type: 'image', data: d.data, mediaType: d.mimeType ?? d.mime_type });
      } else if (p.fileData ?? p.file_data) {
        const d = p.fileData ?? p.file_data;
        parts.push({ type: 'image', url: d.fileUri ?? d.file_uri, mediaType: d.mimeType ?? d.mime_type });
      } else if (p.functionCall ?? p.function_call) {
        const f = p.functionCall ?? p.function_call;
        const id = f.id ?? `call_${++n}`;
        const q = idFor.get(f.name) ?? [];
        q.push(id);
        idFor.set(f.name, q);
        parts.push({ type: 'tool_call', id, name: f.name, args: f.args ?? {} });
      } else if (p.functionResponse ?? p.function_response) {
        const f = p.functionResponse ?? p.function_response;
        const id = f.id ?? idFor.get(f.name)?.shift() ?? `call_${++n}`;
        const r = f.response;
        const content = r && typeof r === 'object' && Object.keys(r).length === 1 && typeof (r.result ?? r.output ?? r.content) === 'string'
          ? (r.result ?? r.output ?? r.content)
          : JSON.stringify(r);
        parts.push({ type: 'tool_result', id, name: f.name, content });
      }
    }
    conv.turns.push({ role: c.role === 'model' ? 'assistant' : 'user', parts });
  }
  return conv;
}

export function parseChat(input: unknown, format: ChatFormat): Conversation {
  return format === 'openai' ? parseOpenAI(input) : format === 'anthropic' ? parseAnthropic(input) : parseGemini(input);
}

// ------------------------------------------------------------------ emit

export interface EmitResult {
  output: unknown;
  warnings: string[];
}

function emitOpenAI(c: Conversation): EmitResult {
  const warnings: string[] = [];
  const messages: J[] = [];
  if (c.system) messages.push({ role: 'system', content: c.system });
  for (const t of c.turns) {
    if (t.role === 'assistant') {
      const txt = t.parts.filter((p) => p.type === 'text').map((p) => (p as { text: string }).text).join('');
      const calls = t.parts.filter((p) => p.type === 'tool_call') as Extract<Part, { type: 'tool_call' }>[];
      const m: J = { role: 'assistant', content: txt || null };
      if (calls.length) {
        m.tool_calls = calls.map((p) => ({
          id: p.id,
          type: 'function',
          function: { name: p.name, arguments: typeof p.args === 'string' ? p.args : JSON.stringify(p.args) },
        }));
      }
      messages.push(m);
      continue;
    }
    for (const p of t.parts) {
      if (p.type === 'tool_result') messages.push({ role: 'tool', tool_call_id: p.id, content: p.content });
    }
    const rest = t.parts.filter((p) => p.type === 'text' || p.type === 'image');
    if (!rest.length) continue;
    if (rest.length === 1 && rest[0].type === 'text') messages.push({ role: 'user', content: rest[0].text });
    else {
      messages.push({
        role: 'user',
        content: rest.map((p) =>
          p.type === 'text'
            ? { type: 'text', text: p.text }
            : { type: 'image_url', image_url: { url: p.type === 'image' && p.data ? `data:${p.mediaType};base64,${p.data}` : (p as { url?: string }).url } },
        ),
      });
    }
  }
  return { output: { messages }, warnings };
}

function emitAnthropic(c: Conversation): EmitResult {
  const warnings: string[] = [];
  const messages: J[] = [];
  for (const t of c.turns) {
    const blocks: J[] = [];
    for (const p of t.parts) {
      if (p.type === 'text') blocks.push({ type: 'text', text: p.text });
      else if (p.type === 'image') {
        blocks.push({
          type: 'image',
          source: p.data ? { type: 'base64', media_type: p.mediaType, data: p.data } : { type: 'url', url: p.url },
        });
      } else if (p.type === 'tool_call') blocks.push({ type: 'tool_use', id: p.id, name: p.name, input: p.args ?? {} });
      else if (p.type === 'tool_result') {
        const b: J = { type: 'tool_result', tool_use_id: p.id, content: p.content };
        if (p.isError) b.is_error = true;
        blocks.push(b);
      }
    }
    if (!blocks.length) continue;
    const prev = messages[messages.length - 1];
    if (prev && prev.role === t.role) {
      // Anthropic requires alternating roles: merge consecutive turns.
      prev.content.push(...blocks);
      if (!warnings.includes('merged')) warnings.push('merged');
    } else messages.push({ role: t.role, content: blocks });
  }
  // Tool results must come first in a user message.
  for (const m of messages) {
    if (m.role === 'user') m.content.sort((a: J, b: J) => Number(b.type === 'tool_result') - Number(a.type === 'tool_result'));
    if (m.content.length === 1 && m.content[0].type === 'text') m.content = m.content[0].text;
  }
  if (messages[0]?.role === 'assistant') warnings.push('starts-with-assistant');
  const output: J = {};
  if (c.system) output.system = c.system;
  output.messages = messages;
  return { output, warnings };
}

function emitGemini(c: Conversation): EmitResult {
  const warnings: string[] = [];
  const contents: J[] = [];
  for (const t of c.turns) {
    const parts: J[] = [];
    for (const p of t.parts) {
      if (p.type === 'text') parts.push({ text: p.text });
      else if (p.type === 'image') {
        if (p.data) parts.push({ inlineData: { mimeType: p.mediaType, data: p.data } });
        else {
          parts.push({ fileData: { mimeType: p.mediaType ?? 'image/jpeg', fileUri: p.url } });
          if (!warnings.includes('image-url')) warnings.push('image-url');
        }
      } else if (p.type === 'tool_call') {
        parts.push({ functionCall: { name: p.name, args: typeof p.args === 'object' && p.args ? p.args : {} } });
      } else if (p.type === 'tool_result') {
        let response: unknown;
        try {
          const v = JSON.parse(p.content);
          response = v && typeof v === 'object' && !Array.isArray(v) ? v : { result: v };
        } catch {
          response = { result: p.content };
        }
        parts.push({ functionResponse: { name: p.name ?? 'unknown_tool', response } });
      }
    }
    if (!parts.length) continue;
    const role = t.role === 'assistant' ? 'model' : 'user';
    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) prev.parts.push(...parts);
    else contents.push({ role, parts });
  }
  const output: J = {};
  if (c.system) output.systemInstruction = { parts: [{ text: c.system }] };
  output.contents = contents;
  return { output, warnings };
}

export function emitChat(c: Conversation, format: ChatFormat): EmitResult {
  return format === 'openai' ? emitOpenAI(c) : format === 'anthropic' ? emitAnthropic(c) : emitGemini(c);
}

export function convertChat(input: unknown, to: ChatFormat, from: ChatFormat = detectFormat(input)) {
  const conv = parseChat(input, from);
  return { from, ...emitChat(conv, to), turns: conv.turns.length };
}
