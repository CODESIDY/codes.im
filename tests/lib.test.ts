import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseJson, formatJson, offsetToLineCol } from '../src/lib/json.ts';
import { jsonToTs } from '../src/lib/json-to-ts.ts';
import { encodeBase64, decodeBase64, decodeJwt } from '../src/lib/encoding.ts';
import { detectUnit, toMillis } from '../src/lib/time.ts';
import { uuidv4, uuidv7, uuidv7Time } from '../src/lib/uuid.ts';
import { md5 } from '../src/lib/md5.ts';
import { parseColor, formats, contrastRatio } from '../src/lib/color.ts';

test('json: format, sort and error position', () => {
  const r = parseJson('{"b":1,"a":[1,2]}');
  assert.ok(r.ok);
  assert.equal(formatJson(r.value, 2, true), '{\n  "a": [\n    1,\n    2\n  ],\n  "b": 1\n}');
  const bad = parseJson('{\n  "a": 1,\n}');
  assert.ok(!bad.ok);
  assert.equal(bad.error.line, 3);
  assert.deepEqual(offsetToLineCol('ab\ncd', 4), { line: 2, column: 2 });
});

test('json-to-ts: nested, optional, union, quoted keys', () => {
  const out = jsonToTs(
    { id: 1, user: { name: 'a' }, tags: ['x'], items: [{ a: 1 }, { a: 2, b: 'x' }], 'first-name': null, mixed: [1, 'a'], opt: [null, 's'] },
    { rootName: 'Root' },
  );
  assert.match(out, /export interface Root \{/);
  assert.match(out, /user: User;/);
  assert.match(out, /tags: string\[\];/);
  assert.match(out, /items: Item\[\];/);
  assert.match(out, /b\?: string;/);
  assert.match(out, /"first-name": null;/);
  assert.match(out, /mixed: \(number \| string\)\[\];/);
  assert.match(out, /opt: \(string \| null\)\[\];/);
  assert.ok(out.indexOf('interface Root') < out.indexOf('interface User'));
  assert.match(jsonToTs([{ a: 1 }], { style: 'type' }), /export type Root = RootItem\[\];[\s\S]*export type RootItem = \{/);
});

test('base64: utf-8 round trip and url-safe', () => {
  const s = '你好, world 🌍';
  assert.equal(decodeBase64(encodeBase64(s)), s);
  assert.equal(encodeBase64('ÿÿ>', true), 'w7_Dvz4');
  assert.equal(decodeBase64('w7_Dvz4'), 'ÿÿ>');
  assert.throws(() => decodeBase64('***'));
});

test('jwt: decode', () => {
  const tok =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const d = decodeJwt(tok);
  assert.equal(d.header.alg, 'HS256');
  assert.equal(d.payload.name, 'John Doe');
  assert.throws(() => decodeJwt('a.b'));
});

test('time: unit detection', () => {
  assert.equal(detectUnit(1700000000), 's');
  assert.equal(detectUnit(1700000000000), 'ms');
  assert.equal(detectUnit(1700000000000000), 'us');
  assert.equal(detectUnit(1700000000000000000), 'ns');
  assert.equal(toMillis(1700000000, 's'), 1700000000000);
});

test('uuid: v4 / v7 format', () => {
  assert.match(uuidv4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const t = 1730000000123;
  const v7 = uuidv7(t);
  assert.match(v7, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(uuidv7Time(v7), t);
});

test('md5 matches node:crypto', () => {
  for (const s of ['', 'abc', 'The quick brown fox jumps over the lazy dog', 'x'.repeat(1000), '中文🌍']) {
    const bytes = new TextEncoder().encode(s);
    assert.equal(md5(bytes), createHash('md5').update(bytes).digest('hex'));
  }
});

test('color: parse and convert', () => {
  const c = parseColor('#10b981')!;
  assert.deepEqual([c.r, c.g, c.b], [16, 185, 129]);
  const f = formats(c);
  assert.equal(f.rgb, 'rgb(16 185 129)');
  assert.equal(formats(parseColor(f.hsl)!).hex, '#10b981');
  assert.equal(formats(parseColor(f.oklch)!).hex, '#10b981');
  assert.equal(formats(parseColor('rgba(255, 0, 0, 0.5)')!).hex, '#ff000080');
  assert.equal(formats(parseColor('#fff')!).hex, '#ffffff');
  assert.equal(Math.round(contrastRatio(parseColor('#000')!, parseColor('#fff')!)), 21);
  assert.equal(parseColor('nope'), null);
});
