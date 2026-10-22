import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse as parseYaml, stringify as toYaml } from 'yaml';
import { repairJson } from '../src/lib/json-repair.ts';
import { detectSyntax, fillTemplate, findVariables, toCode } from '../src/lib/prompt-template.ts';
import { convertChat, detectFormat } from '../src/lib/chat-format.ts';
import { parseOperations, toTools } from '../src/lib/openapi-tools.ts';
import { chunkText } from '../src/lib/chunk.ts';
import { csvToJson, jsonToCsv, parseCsv, detectDelimiter } from '../src/lib/csv.ts';

test('json repair: llm-style mess', () => {
  const r = repairJson("Sure! Here's the data:\n```json\n{\n  name: 'Ada', // comment\n  \"tags\": [\"a\", \"b\",],\n  active: True,\n  score: .5,\n  note: None\n}\n```\nLet me know!");
  assert.deepEqual(r.value, { name: 'Ada', tags: ['a', 'b'], active: true, score: 0.5, note: null });
  for (const f of ['fence', 'unquoted-key', 'quotes', 'comment', 'trailing-comma', 'literal', 'number']) assert.ok(r.fixes.includes(f as never), f);
});

test('json repair: truncated, missing commas, raw newlines, inner quotes', () => {
  assert.deepEqual(repairJson('{"a": [1, 2, {"b": "hel').value, { a: [1, 2, { b: 'hel' }] });
  assert.deepEqual(repairJson('{"a": 1\n "b": 2}').value, { a: 1, b: 2 });
  assert.deepEqual(repairJson('{"t": "line1\nline2"}').value, { t: 'line1\nline2' });
  assert.deepEqual(repairJson('{"q": "he said "hi" ok"}').value, { q: 'he said "hi" ok' });
  assert.deepEqual(repairJson('[{“a”: “b”}]').value, [{ a: 'b' }]);
  assert.deepEqual(repairJson('{"a": tru').value, { a: true });
  assert.deepEqual(repairJson('{"ok": true}').fixes, []);
  assert.deepEqual(repairJson('{"a":1,"b":}').value, { a: 1, b: null });
});

test('prompt templates', () => {
  const t = 'Hello {{ name }}, summarise {{doc}} in {{lang}}. Keep {{name}}.';
  assert.equal(detectSyntax(t), 'double');
  assert.deepEqual(findVariables(t, 'double'), ['name', 'doc', 'lang']);
  assert.equal(fillTemplate(t, 'double', { name: 'Ada', doc: 'X' }), 'Hello Ada, summarise X in {{lang}}. Keep Ada.');
  assert.equal(detectSyntax('Use {topic} and {style}, JSON like {{"a":1}}'), 'single');
  assert.deepEqual(findVariables('Use {topic} and {style}', 'single'), ['topic', 'style']);
  assert.equal(detectSyntax('x ${a} ${b}'), 'dollar');
  const py = toCode('Hi {{name}}! Output {"k": 1}', 'double', { name: 'Ada' }, 'python');
  assert.match(py, /PROMPT = """Hi \{name\}! Output \{\{"k": 1\}\}"""/);
  assert.match(py, /name="Ada",/);
  const js = toCode('Hi {{name}} `x` ${y}', 'double', { name: 'A' }, 'js');
  assert.match(js, /\(\{ name \}\) => `Hi \$\{name\} \\`x\\` \\\$\{y\}`/);
});

const openaiChat = [
  { role: 'system', content: 'Be brief.' },
  { role: 'user', content: [{ type: 'text', text: 'Weather?' }, { type: 'image_url', image_url: { url: 'data:image/png;base64,AAAA' } }] },
  { role: 'assistant', content: null, tool_calls: [{ id: 'c1', type: 'function', function: { name: 'weather', arguments: '{"city":"Paris"}' } }] },
  { role: 'tool', tool_call_id: 'c1', content: '{"temp":21}' },
  { role: 'assistant', content: 'It is 21°C.' },
];

test('chat: openai → anthropic → openai round trip', () => {
  assert.equal(detectFormat(openaiChat), 'openai');
  const a = convertChat(openaiChat, 'anthropic').output as any;
  assert.equal(a.system, 'Be brief.');
  assert.equal(a.messages.length, 4);
  assert.deepEqual(a.messages[0].content[1], { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AAAA' } });
  assert.deepEqual(a.messages[1].content[0], { type: 'tool_use', id: 'c1', name: 'weather', input: { city: 'Paris' } });
  assert.deepEqual(a.messages[2], { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'c1', content: '{"temp":21}' }] });
  assert.equal(detectFormat(a), 'anthropic');
  const back = convertChat(a, 'openai').output as any;
  assert.deepEqual(back.messages, openaiChat);
});

test('chat: to gemini and back', () => {
  const g = convertChat(openaiChat, 'gemini').output as any;
  assert.deepEqual(g.systemInstruction, { parts: [{ text: 'Be brief.' }] });
  assert.equal(g.contents[1].role, 'model');
  assert.deepEqual(g.contents[1].parts[0], { functionCall: { name: 'weather', args: { city: 'Paris' } } });
  assert.deepEqual(g.contents[2].parts[0], { functionResponse: { name: 'weather', response: { temp: 21 } } });
  assert.equal(detectFormat(g), 'gemini');
  const o = convertChat(g, 'openai').output as any;
  assert.equal(o.messages[2].tool_calls[0].function.name, 'weather');
  assert.equal(o.messages[3].tool_call_id, o.messages[2].tool_calls[0].id);
});

test('openapi → tools', () => {
  const spec = parseYaml(`
openapi: 3.0.0
info: {title: Pets, version: '1'}
paths:
  /pets/{petId}:
    parameters:
      - {name: petId, in: path, required: true, schema: {type: string}, description: The pet id}
    get:
      operationId: getPet
      summary: Get a pet
      parameters:
        - {name: verbose, in: query, schema: {type: boolean}}
    put:
      summary: Update a pet
      requestBody:
        required: true
        content:
          application/json:
            schema: {$ref: '#/components/schemas/Pet'}
components:
  schemas:
    Pet:
      type: object
      required: [name]
      properties:
        name: {type: string, example: Rex}
        tag: {type: string, nullable: true}
        parent: {$ref: '#/components/schemas/Pet'}
`);
  const ops = parseOperations(spec);
  assert.equal(ops.length, 2);
  assert.equal(ops[0].name, 'getPet');
  assert.deepEqual(ops[0].parameters.required, ['petId']);
  assert.equal(ops[0].parameters.properties.petId.description, 'The pet id');
  assert.equal(ops[1].name, 'put_pets_by_petId');
  assert.deepEqual(ops[1].parameters.required, ['petId', 'name']);
  assert.deepEqual(ops[1].parameters.properties.tag.type, ['string', 'null']);
  assert.equal(ops[1].parameters.properties.name.example, undefined);
  assert.match(ops[1].parameters.properties.parent.description, /recursive/);
  const t = toTools(ops, 'anthropic') as any[];
  assert.equal(t[0].input_schema.type, 'object');
  assert.equal((toTools(ops, 'openai') as any[])[0].function.name, 'getPet');
  assert.ok((toTools(ops, 'mcp') as any[])[0].inputSchema);
  assert.throws(() => parseOperations({}));
});

test('chunking', () => {
  const text = 'Para one is here.\n\nPara two is a bit longer than one. It has two sentences.\n\nThree.';
  const c = chunkText(text, { size: 40, overlap: 0 });
  assert.ok(c.every((x) => x.length <= 40));
  assert.equal(c.map((x) => x.text).join(''), text);
  for (const x of c) assert.equal(text.slice(x.start, x.end), x.text);
  const o = chunkText('a b c d e f g h i j', { size: 6, overlap: 2 });
  assert.ok(o.length > 1);
  for (const x of o) assert.equal('a b c d e f g h i j'.slice(x.start, x.end), x.text);
  assert.ok(o[1].start < o[0].end, 'overlap');
  const zh = chunkText('第一句话。第二句话。第三句话。', { size: 6, overlap: 0 });
  assert.deepEqual(zh.map((x) => x.text), ['第一句话。', '第二句话。', '第三句话。']);
});

test('csv', () => {
  assert.equal(detectDelimiter('a;b;c\n1;2;3'), ';');
  assert.deepEqual(parseCsv('a,b\n"x, y","he said ""hi"""\n"multi\nline",2\n'), [['a', 'b'], ['x, y', 'he said "hi"'], ['multi\nline', '2']]);
  assert.deepEqual(csvToJson('id,name,ok,user.age\n1,Ada,true,36\n2,,false,', { nest: true }), [
    { id: 1, name: 'Ada', ok: true, user: { age: 36 } },
    { id: 2, name: null, ok: false, user: { age: null } },
  ]);
  assert.equal(jsonToCsv([{ a: 1, b: { c: 'x,y' } }, { a: 2, d: [1, 2] }]), 'a,b.c,d\n1,"x,y",\n2,,"[1,2]"\n');
});

test('yaml round trip', () => {
  const v = { a: 1, list: ['x', 'y'], nested: { ok: true } };
  assert.deepEqual(parseYaml(toYaml(v)), v);
});
