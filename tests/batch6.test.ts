import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMinutes, textStats, topWords } from '../src/lib/text-stats.ts';
import { addressKind, contains, formatIPv4, maskToPrefix, parseCidr, parseIPv4, rangeToCidrs, splitSubnets, subnetInfo } from '../src/lib/cidr.ts';
import { aiRobotsTxt, parseUA } from '../src/lib/ua.ts';
import { formatRows, generateRows, paragraphs } from '../src/lib/fake-data.ts';
import { buildRequest, parseResponse, toCurl } from '../src/lib/llm-request.ts';

test('text stats: mixed Chinese and English', () => {
  const s = textStats('你好，世界！Hello world, it’s a test.\n\n第二段。');
  assert.equal(s.cjk, 7);
  assert.equal(s.words, 5);
  assert.equal(s.mixedCount, 12);
  assert.equal(s.paragraphs, 2);
  assert.equal(s.lines, 3);
  assert.equal(textStats('👍🏽 ok').chars, 4);
  assert.equal(textStats('').sentences, 0);
  assert.equal(textStats('One. Two! Three?').sentences, 3);
  assert.equal(textStats('é').bytes, 2);
  assert.equal(formatMinutes(0.5, 'en'), '30 sec');
  assert.equal(formatMinutes(75, 'zh'), '1 小时 15 分钟');
});

test('text stats: top words', () => {
  const top = topWords('The cache cache key. Cache invalidation is hard; 缓存 缓存 一致性');
  assert.equal(top[0][0], 'cache');
  assert.equal(top[0][1], 3);
  assert.ok(top.some(([w]) => w === '一致性'));
  assert.ok(!top.some(([w]) => w === 'the' || w === 'is'));
});

test('cidr basics', () => {
  assert.equal(formatIPv4(parseIPv4('192.168.1.10')), '192.168.1.10');
  assert.throws(() => parseIPv4('256.1.1.1'));
  const info = subnetInfo(parseCidr('192.168.1.130/26'));
  assert.equal(info.cidr, '192.168.1.128/26');
  assert.equal(info.network, '192.168.1.128');
  assert.equal(info.broadcast, '192.168.1.191');
  assert.equal(info.firstHost, '192.168.1.129');
  assert.equal(info.lastHost, '192.168.1.190');
  assert.equal(info.usable, 62);
  assert.equal(info.mask, '255.255.255.192');
  assert.equal(info.wildcard, '0.0.0.63');
  assert.equal(info.kind, 'private');
  assert.equal(info.ipClass, 'C');
  assert.equal(subnetInfo(parseCidr('10.0.0.0/31')).usable, 2);
  assert.equal(subnetInfo(parseCidr('8.8.8.8')).usable, 1);
  assert.equal(subnetInfo(parseCidr('0.0.0.0/0')).total, 2 ** 32);
  assert.equal(parseCidr('10.1.2.3 255.255.0.0').prefix, 16);
  assert.equal(maskToPrefix(parseIPv4('255.255.255.0')), 24);
  assert.throws(() => maskToPrefix(parseIPv4('255.0.255.0')), /contiguous/);
  assert.ok(contains(parseCidr('10.0.0.0/8'), parseIPv4('10.20.30.40')));
  assert.ok(!contains(parseCidr('10.0.0.0/8'), parseIPv4('11.0.0.1')));
  assert.equal(addressKind(parseIPv4('100.64.1.1')), 'cgnat');
  assert.equal(addressKind(parseIPv4('1.1.1.1')), 'public');
});

test('cidr split and range', () => {
  const s = splitSubnets(parseCidr('10.0.0.0/24'), 26);
  assert.equal(s.count, 4);
  assert.deepEqual(s.subnets, ['10.0.0.0/26', '10.0.0.64/26', '10.0.0.128/26', '10.0.0.192/26']);
  assert.deepEqual(rangeToCidrs(parseIPv4('10.0.0.0'), parseIPv4('10.0.0.255')), ['10.0.0.0/24']);
  assert.deepEqual(rangeToCidrs(parseIPv4('192.168.0.1'), parseIPv4('192.168.0.6')), ['192.168.0.1/32', '192.168.0.2/31', '192.168.0.4/31', '192.168.0.6/32']);
  assert.deepEqual(rangeToCidrs(0, 2 ** 32 - 1), ['0.0.0.0/0']);
});

test('user agent parsing', () => {
  const chrome = parseUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
  assert.equal(chrome.browser.name, 'Chrome');
  assert.equal(chrome.browser.version, '130.0.0.0');
  assert.equal(chrome.os.name, 'Windows');
  assert.equal(chrome.engine.name, 'Blink');
  assert.equal(chrome.device, 'desktop');
  const edge = parseUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.68');
  assert.equal(edge.browser.name, 'Microsoft Edge');
  assert.equal(edge.os.name, 'macOS');
  assert.equal(edge.os.version, '10.15.7');
  const iphone = parseUA('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1');
  assert.equal(iphone.browser.name, 'Safari');
  assert.equal(iphone.os.name, 'iOS');
  assert.equal(iphone.os.version, '18.1');
  assert.equal(iphone.device, 'mobile');
  assert.equal(iphone.engine.name, 'WebKit');
  const wechat = parseUA('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 MicroMessenger/8.0.50');
  assert.equal(wechat.browser.name, 'WeChat');
  assert.equal(wechat.os.name, 'Android');
  assert.equal(wechat.device, 'mobile');
  const ff = parseUA('Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0');
  assert.equal(ff.browser.name, 'Firefox');
  assert.equal(ff.engine.name, 'Gecko');
  const bot = parseUA('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)');
  assert.equal(bot.device, 'bot');
  assert.equal(bot.bot?.owner, 'Anthropic');
  assert.equal(bot.bot?.kind, 'ai');
  assert.equal(parseUA('curl/8.5.0').bot?.kind, 'tool');
  assert.equal(parseUA('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)').bot?.kind, 'search');
  assert.match(aiRobotsTxt(), /User-agent: GPTBot\nDisallow: \//);
});

test('fake data', () => {
  const fields = [
    { key: 'id', type: 'id' as const },
    { key: 'name', type: 'name' as const },
    { key: 'email', type: 'email' as const },
    { key: 'phone', type: 'phone' as const },
    { key: 'active', type: 'bool' as const },
  ];
  const a = generateRows(42, 3, fields, 'en');
  assert.deepEqual(a, generateRows(42, 3, fields, 'en'), 'deterministic for the same seed');
  assert.equal(a[2].id, 3);
  assert.match(String(a[0].email), /^[a-z]+\.[a-z]+@example\.(com|org|net)$/);
  assert.match(String(a[0].phone), /^\(\d{3}\) 555-01\d{2}$/);
  const zh = generateRows(1, 5, fields, 'zh');
  assert.match(String(zh[0].name), /^\p{Script=Han}{2,3}$/u);
  assert.match(String(zh[0].phone), /^1\d{10}$/);
  assert.match(formatRows(a, 'csv'), /^id,name,email,phone,active\n1,/);
  assert.match(formatRows(a, 'sql', 'people'), /^INSERT INTO people \(id, name, email, phone, active\) VALUES\n  \(1, '/);
  assert.equal(formatRows(a, 'jsonl').split('\n').length, 3);
  const p = paragraphs(7, 2, 'en');
  assert.equal(p.length, 2);
  assert.ok(p[0].startsWith('Lorem ipsum dolor sit amet'));
  assert.ok(paragraphs(7, 1, 'zh')[0].endsWith('。'));
});

test('llm request building', () => {
  const o = buildRequest({ kind: 'openai', baseUrl: 'https://api.example.com/v1/', apiKey: 'sk-test', model: 'm', system: 'S', user: 'U', stream: true, maxTokens: 50 });
  assert.equal(o.url, 'https://api.example.com/v1/chat/completions');
  assert.equal(o.headers.authorization, 'Bearer sk-test');
  assert.deepEqual(o.body.messages, [
    { role: 'system', content: 'S' },
    { role: 'user', content: 'U' },
  ]);
  assert.deepEqual(o.body.stream_options, { include_usage: true });
  const a = buildRequest({
    kind: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKey: 'k',
    model: 'claude',
    user: 'hi',
    tools: [{ type: 'function', function: { name: 'f', parameters: { type: 'object' } } }],
    jsonSchema: { type: 'object' },
  });
  assert.equal(a.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(a.headers['anthropic-dangerous-direct-browser-access'], 'true');
  assert.equal(a.body.max_tokens, 1024);
  assert.deepEqual((a.body.tools as { name: string }[]).map((t) => t.name), ['f', 'respond']);
  assert.deepEqual(a.body.tool_choice, { type: 'tool', name: 'respond' });
  const curl = toCurl(o);
  assert.match(curl, /Bearer \$API_KEY/);
  assert.ok(!curl.includes('sk-test'));
  assert.throws(() => buildRequest({ kind: 'openai', baseUrl: '', apiKey: '', model: 'm', user: 'u' }), /Base URL/);
});

test('llm response parsing', () => {
  const oa = parseResponse('openai', {
    model: 'm',
    choices: [{ finish_reason: 'tool_calls', message: { content: null, tool_calls: [{ function: { name: 'get', arguments: '{"a":1}' } }] } }],
    usage: { prompt_tokens: 5 },
  });
  assert.deepEqual(oa.toolCalls, [{ name: 'get', arguments: '{"a":1}' }]);
  assert.equal(oa.finishReason, 'tool_calls');
  const an = parseResponse('anthropic', { content: [{ type: 'text', text: 'Hi' }, { type: 'tool_use', name: 't', input: { x: 1 } }], stop_reason: 'tool_use' });
  assert.equal(an.text, 'Hi');
  assert.equal(an.toolCalls[0].name, 't');
  assert.throws(() => parseResponse('openai', { error: { message: 'Invalid key' } }), /Invalid key/);
});

test('stream usage-only final chunk', async () => {
  const { parseStream } = await import('../src/lib/sse.ts');
  const raw =
    ['{"model":"m","choices":[{"delta":{"content":"Hi"}}]}', '{"choices":[],"usage":{"prompt_tokens":5,"completion_tokens":2}}'].map((d) => `data: ${d}\n\n`).join('') + 'data: [DONE]\n\n';
  const r = parseStream(raw);
  assert.equal(r.text, 'Hi');
  assert.deepEqual(r.usage, { prompt_tokens: 5, completion_tokens: 2 });
});

test('tool chaining', async () => {
  const { detectPayload, targetsFor, targetState } = await import('../src/data/chain.ts');
  assert.deepEqual(detectPayload('{"a":1}'), ['json']);
  assert.deepEqual(detectPayload('{"a":1,}'), ['badjson', 'text']);
  assert.deepEqual(detectPayload('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig'), ['jwt', 'text']);
  assert.deepEqual(detectPayload("curl https://x -H 'a: b'"), ['curl', 'text']);
  assert.deepEqual(detectPayload('data: {"x":1}\n\n'), ['sse', 'text']);
  assert.deepEqual(detectPayload('SELECT * FROM t'), ['sql', 'text']);
  assert.deepEqual(detectPayload('hello'), ['text']);
  assert.deepEqual(detectPayload('  '), []);
  const json = targetsFor('json-formatter', ['json']).map((t) => t.slug);
  assert.ok(!json.includes('json-formatter'));
  assert.equal(json[0], 'json-path');
  assert.ok(json.includes('token-counter'), 'secondary json targets follow');
  assert.ok(json.indexOf('json-to-zod') < json.indexOf('token-counter'));
  assert.ok(!json.includes('word-counter'));
  const bad = targetsFor('llm-api-playground', ['badjson', 'text']).map((t) => t.slug);
  assert.equal(bad[0], 'json-repair');
  const yaml = targetsFor('x', ['json']).find((t) => t.slug === 'yaml-json')!;
  assert.deepEqual(targetState(yaml, '{}'), { 'yj-dir=j2y': true, '#yj-in': '{}' });
});
