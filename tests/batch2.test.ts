import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jsonToSchema, jsonToZod, wrapSchema } from '../src/lib/schema.ts';
import { parseCurl, shellSplit, toFetch, toPython, toGo } from '../src/lib/curl.ts';
import { nextRuns, parseCron } from '../src/lib/cron.ts';
import { parseStream } from '../src/lib/sse.ts';
import { validateJsonl, arrayToJsonl, jsonlToArray } from '../src/lib/jsonl.ts';
import { markdownToPlain, markdownToRichHtml } from '../src/lib/markdown.ts';
import { generateConfig, splitCommand } from '../src/lib/mcp.ts';

const sample = { name: 'a', age: 3, tags: ['x'], items: [{ id: 1 }, { id: 2, note: 'n' }], bio: null };

test('json schema: normal and strict', () => {
  const s = jsonToSchema(sample) as any;
  assert.equal(s.type, 'object');
  assert.deepEqual(s.required, ['name', 'age', 'tags', 'items', 'bio']);
  assert.deepEqual(s.properties.items.items.required, ['id']);
  assert.equal(s.properties.bio.type, 'null');
  const strict = jsonToSchema(sample, { strict: true }) as any;
  assert.deepEqual(strict.properties.items.items.required, ['id', 'note']);
  assert.deepEqual(strict.properties.items.items.properties.note.type, ['string', 'null']);
  assert.equal(strict.additionalProperties, false);
  const w = wrapSchema(strict, 'openai-response', 'my schema!') as any;
  assert.equal(w.json_schema.name, 'my_schema_');
  assert.equal(w.json_schema.schema.$schema, undefined);
  assert.ok((wrapSchema(strict, 'anthropic-tool', 'x') as any).input_schema);
});

test('zod', () => {
  const z = jsonToZod({ a: 1, b: [null, 'x'], c: [{ d: 1 }, {}], 'e-f': true });
  assert.match(z, /a: z\.number\(\),/);
  assert.match(z, /b: z\.array\(z\.string\(\)\.nullable\(\)\),/);
  assert.match(z, /d: z\.number\(\)\.optional\(\),/);
  assert.match(z, /"e-f": z\.boolean\(\),/);
  assert.match(z, /export type Root = z\.infer<typeof RootSchema>;/);
});

test('curl parsing', () => {
  assert.deepEqual(shellSplit(`curl -H 'A: b c' "x\\"y" a\\ b`), ['curl', '-H', 'A: b c', 'x"y', 'a b']);
  const r = parseCurl(`curl https://api.openai.com/v1/chat/completions \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer $KEY" \\
    -d '{"model":"gpt-4o","messages":[{"role":"user","content":"hi"}]}'`);
  assert.equal(r.method, 'POST');
  assert.equal(r.headers.length, 2);
  assert.match(toFetch(r), /body: JSON\.stringify\(\{\n    "model": "gpt-4o"/);
  assert.match(toPython(r), /json=payload/);
  assert.match(toPython(r), /requests\.post\(/);
  assert.match(toGo(r), /http\.NewRequest\("POST"/);
  const g = parseCurl(`curl -G https://x.io/s -d q=1 --data-urlencode "n=a b" -u me:pw -XGET`);
  assert.equal(g.url, 'https://x.io/s?q=1&n=a%20b');
  assert.equal(g.method, 'GET');
  assert.equal(g.auth, 'me:pw');
  const f = parseCurl(`curl -F file=@a.png -F name=x https://up.io`);
  assert.equal(f.method, 'POST');
  assert.deepEqual(f.form, [['file', '@a.png'], ['name', 'x']]);
  assert.throws(() => parseCurl('wget x'));
});

test('cron', () => {
  const from = new Date(2026, 0, 1, 10, 30); // Thu 1 Jan 2026 10:30 local
  const r = nextRuns('*/15 9-17 * * 1-5', 3, from);
  assert.deepEqual(r.map((d) => [d.getDate(), d.getHours(), d.getMinutes()]), [[1, 10, 45], [1, 11, 0], [1, 11, 15]]);
  const w = nextRuns('0 0 * * 7', 1, from);
  assert.equal(w[0].getDay(), 0);
  assert.equal(nextRuns('@monthly', 1, from)[0].getMonth(), 1);
  assert.equal(nextRuns('0 12 1 JAN,JUL *', 2, from)[1].getMonth(), 6);
  assert.equal(parseCron('0 0 * * SUN-SAT').dow.size, 7);
  assert.throws(() => parseCron('61 * * * *'));
  assert.throws(() => parseCron('* * *'));
});

test('sse: openai chat with tools', () => {
  const raw = [
    'data: {"object":"chat.completion.chunk","model":"gpt-4o","choices":[{"index":0,"delta":{"role":"assistant","content":"Hel"}}]}',
    '',
    'data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"lo"}}]}',
    'data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"c1","function":{"name":"get","arguments":"{\\"a\\""}}]}}]}',
    'data: {"object":"chat.completion.chunk","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":":1}"}}]},"finish_reason":"tool_calls"}]}',
    'data: [DONE]',
  ].join('\n');
  const r = parseStream(raw);
  assert.equal(r.provider, 'openai-chat');
  assert.equal(r.text, 'Hello');
  assert.deepEqual(r.toolCalls, [{ id: 'c1', name: 'get', arguments: '{"a":1}' }]);
  assert.equal(r.finishReason, 'tool_calls');
});

test('sse: anthropic', () => {
  const raw = `event: message_start
data: {"type":"message_start","message":{"model":"claude-x","usage":{"input_tokens":10,"output_tokens":1}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"thinking","thinking":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"Hmm"}}

event: content_block_start
data: {"type":"content_block_start","index":1,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":1,"delta":{"type":"text_delta","text":"Hi!"}}

event: content_block_start
data: {"type":"content_block_start","index":2,"content_block":{"type":"tool_use","id":"t1","name":"search","input":{}}}

event: content_block_delta
data: {"type":"content_block_delta","index":2,"delta":{"type":"input_json_delta","partial_json":"{\\"q\\":"}}

event: content_block_delta
data: {"type":"content_block_delta","index":2,"delta":{"type":"input_json_delta","partial_json":"\\"x\\"}"}}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"tool_use"},"usage":{"output_tokens":42}}

event: message_stop
data: {"type":"message_stop"}`;
  const r = parseStream(raw);
  assert.equal(r.provider, 'anthropic');
  assert.equal(r.model, 'claude-x');
  assert.equal(r.text, 'Hi!');
  assert.equal(r.reasoning, 'Hmm');
  assert.deepEqual(r.toolCalls, [{ id: 't1', name: 'search', arguments: '{"q":"x"}' }]);
  assert.equal(r.finishReason, 'tool_use');
  assert.equal(r.usage?.output_tokens, 42);
  assert.equal(r.usage?.input_tokens, 10);
});

test('sse: responses api, gemini, ollama', () => {
  const resp = parseStream(
    [
      'event: response.output_text.delta',
      'data: {"type":"response.output_text.delta","delta":"A"}',
      'data: {"type":"response.output_text.delta","delta":"B"}',
      'data: {"type":"response.completed","response":{"status":"completed","model":"gpt-5","usage":{"total_tokens":5}}}',
    ].join('\n'),
  );
  assert.equal(resp.provider, 'openai-responses');
  assert.equal(resp.text, 'AB');
  assert.equal(resp.model, 'gpt-5');
  const gem = parseStream('data: {"candidates":[{"content":{"parts":[{"text":"Yo"}]}}]}\n\ndata: {"candidates":[{"content":{"parts":[{"text":"!"}]},"finishReason":"STOP"}],"usageMetadata":{"totalTokenCount":3}}');
  assert.equal(gem.provider, 'gemini');
  assert.equal(gem.text, 'Yo!');
  const ol = parseStream('{"model":"llama3","message":{"content":"a"},"done":false}\n{"model":"llama3","message":{"content":"b"},"done":true,"eval_count":2}');
  assert.equal(ol.provider, 'ollama');
  assert.equal(ol.text, 'ab');
});

test('jsonl', () => {
  const good = '{"messages":[{"role":"system","content":"s"},{"role":"user","content":"u"},{"role":"assistant","content":"a"}]}';
  const r = validateJsonl([good, '{"messages":[{"role":"user","content":"u"}]}', '{bad', '{"messages":[{"role":"bot","content":"x"}]}'].join('\n'));
  assert.equal(r.format, 'chat');
  assert.equal(r.lines, 4);
  assert.equal(r.valid, 3);
  assert.ok(r.issues.some((i) => i.line === 2 && /No assistant/.test(i.message)));
  assert.ok(r.issues.some((i) => i.line === 3 && i.level === 'error'));
  assert.ok(r.issues.some((i) => i.line === 4 && /role/.test(i.message)));
  assert.equal(r.roles.user, 2);
  assert.equal(arrayToJsonl('[{"a":1},{"b":2}]'), '{"a":1}\n{"b":2}\n');
  assert.equal(JSON.parse(jsonlToArray('{"a":1}\n\n{"b":2}')).length, 2);
});

test('markdown cleaning', () => {
  const md = '## Title 🚀\n\nSome **bold** and `code` with [link](https://x.io) [1].\n\n- one\n- two\n  1. sub\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```js\nlet x = 1;\n```';
  const plain = markdownToPlain(md, { bullets: true, removeEmoji: true, removeCitations: true, linkUrls: true });
  assert.ok(plain.startsWith('Title\n\nSome bold and code with link (https://x.io).'), plain);
  assert.match(plain, /• one\n• two\n  1\. sub/);
  assert.match(plain, /a\tb\n1\t2/);
  assert.match(plain, /let x = 1;/);
  assert.doesNotMatch(plain, /[#*`🚀]/u);
  const html = markdownToRichHtml('# Hi\n\n**b**');
  assert.match(html, /<h1 style="[^"]+">Hi<\/h1>/);
});

test('mcp config', () => {
  assert.deepEqual(splitCommand('npx -y "@a/b c" /tmp'), { command: 'npx', args: ['-y', '@a/b c', '/tmp'] });
  const s = { name: 'fs', transport: 'stdio' as const, command: 'npx', args: ['-y', 'pkg'], env: [['K', 'v']] as [string, string][] };
  assert.deepEqual(JSON.parse(generateConfig(s, 'claude-desktop')), { mcpServers: { fs: { command: 'npx', args: ['-y', 'pkg'], env: { K: 'v' } } } });
  assert.equal(JSON.parse(generateConfig(s, 'vscode')).servers.fs.type, 'stdio');
  assert.equal(generateConfig(s, 'claude-code'), 'claude mcp add fs -e K=v -- npx -y pkg\n');
  const h = { name: 'gh', transport: 'http' as const, url: 'https://x.io/mcp', headers: [['Authorization', 'Bearer t']] as [string, string][] };
  assert.equal(JSON.parse(generateConfig(h, 'windsurf')).mcpServers.gh.serverUrl, 'https://x.io/mcp');
  assert.deepEqual(JSON.parse(generateConfig(h, 'claude-desktop')).mcpServers.gh.args, ['-y', 'mcp-remote', 'https://x.io/mcp', '--header', 'Authorization: Bearer t']);
  assert.equal(generateConfig(h, 'claude-code'), "claude mcp add --transport http gh https://x.io/mcp --header 'Authorization: Bearer t'\n");
});
