import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jsonToCode } from '../src/lib/json-to-code.ts';
import { buildLlmsTxt, parseLinkLines, sitemapToSections } from '../src/lib/llms-txt.ts';
import { entropyBits, generatePassword, generateToken, randomInt } from '../src/lib/password.ts';
import { codePoints, htmlDecode, htmlEncode, jsonUnescape, unicodeEscape, unicodeUnescape } from '../src/lib/escape.ts';
import { bitLength, group, parseBigInt, toBase, twosComplement } from '../src/lib/base.ts';
import { validateWithSchema } from '../src/lib/schema-validate.ts';

const sample = { user_id: 1, name: 'Ada', score: 9.5, tags: ['a'], address: { city: 'X' }, items: [{ sku: 'a' }, { sku: 'b', qty: 2 }], note: null, class: 'x' };

test('json to pydantic', () => {
  const py = jsonToCode(sample, 'pydantic');
  assert.match(py, /class Address\(BaseModel\):\n    city: str/);
  assert.match(py, /user_id: int\n/);
  assert.match(py, /score: float/);
  assert.match(py, /tags: list\[str\]/);
  assert.match(py, /qty: Optional\[int\] = None/);
  assert.match(py, /note: Optional\[Any\] = None/);
  assert.match(py, /class_: str = Field\(alias="class"\)/);
  assert.ok(py.indexOf('class Address') < py.indexOf('class Root'), 'children first');
});

test('json to go and rust', () => {
  const go = jsonToCode(sample, 'go');
  assert.match(go, /UserID\s+int64\s+`json:"user_id"`/);
  assert.match(go, /Qty\s+\*int64\s+`json:"qty,omitempty"`/);
  assert.match(go, /Items\s+\[\]Item\s+`json:"items"`/);
  const rs = jsonToCode(sample, 'rust');
  assert.match(rs, /pub user_id: i64,/);
  assert.match(rs, /#\[serde\(skip_serializing_if = "Option::is_none"\)\]\n    pub qty: Option<i64>,/);
  assert.match(rs, /pub class: String,/);
  assert.match(jsonToCode([{ a: 1 }], 'go'), /type Root \[\]RootItem/);
});

test('llms.txt', () => {
  const txt = buildLlmsTxt({
    name: 'Acme',
    summary: 'Acme makes   widgets.',
    details: 'Details here.',
    sections: [
      { name: 'Docs', links: parseLinkLines('Quickstart | https://acme.dev/start | Begin here\nhttps://acme.dev/api-reference\n- [FAQ](https://acme.dev/faq): Common questions') },
      { name: 'Optional', links: [] },
    ],
  });
  assert.equal(
    txt,
    '# Acme\n\n> Acme makes widgets.\n\nDetails here.\n\n## Docs\n\n- [Quickstart](https://acme.dev/start): Begin here\n- [Api Reference](https://acme.dev/api-reference)\n- [FAQ](https://acme.dev/faq): Common questions\n',
  );
  const s = sitemapToSections('<urlset><url><loc>https://a.io/docs/intro</loc></url><url><loc>https://a.io/blog/x-y</loc></url><url><loc>https://a.io/</loc></url></urlset>');
  assert.deepEqual(s.map((x) => x.name), ['Docs', 'Blog', 'Pages']);
  assert.equal(s[1].links[0].title, 'X Y');
});

test('passwords and tokens', () => {
  for (let i = 0; i < 50; i++) {
    const p = generatePassword({ length: 12, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: true });
    assert.equal(p.length, 12);
    assert.match(p, /[a-z]/);
    assert.match(p, /[A-Z]/);
    assert.match(p, /[0-9]/);
    assert.doesNotMatch(p, /[Il1O0o]/);
  }
  assert.throws(() => generatePassword({ length: 8, lower: false, upper: false, digits: false, symbols: false, excludeAmbiguous: false }));
  assert.equal(Math.round(entropyBits(16, 62)), 95);
  assert.match(generateToken(16, 'hex'), /^[0-9a-f]{32}$/);
  assert.match(generateToken(32, 'base64url'), /^[A-Za-z0-9_-]{43}$/);
  assert.equal(generateToken(16, 'base62').length, 22);
  const seen = new Set(Array.from({ length: 2000 }, () => randomInt(6)));
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3, 4, 5]);
});

test('escaping', () => {
  assert.equal(htmlEncode('<a href="x">Tom & Jerry\'s</a>'), '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;');
  assert.equal(htmlEncode('中', 'non-ascii'), '&#20013;');
  assert.equal(htmlDecode('&lt;b&gt; &copy; &#x4E2D;&#25991; &unknown;'), '<b> © 中文 &unknown;');
  assert.equal(unicodeEscape('Hi 中😀', 'js'), 'Hi \\u4E2D\\uD83D\\uDE00');
  assert.equal(unicodeEscape('中😀', 'es6'), '\\u{4E2D}\\u{1F600}');
  assert.equal(unicodeEscape('😀', 'python'), '\\U0001F600');
  assert.equal(unicodeUnescape('Hi \\u4E2D\\uD83D\\uDE00 \\u{1F600} \\x41 &#x4E2D;'), 'Hi 中😀 😀 A 中');
  assert.equal(jsonUnescape('line1\\nline2 \\"q\\"'), 'line1\nline2 "q"');
  assert.equal(codePoints('a\u200b')[1].name, 'ZERO WIDTH SPACE');
});

test('base conversion', () => {
  assert.equal(parseBigInt('0xFF', 16), 255n);
  assert.equal(parseBigInt('1111_0000', 2), 240n);
  assert.equal(toBase(255n, 2), '11111111');
  assert.equal(toBase(-255n, 16), '-ff');
  const big = parseBigInt('123456789012345678901234567890', 10);
  assert.equal(toBase(parseBigInt(toBase(big, 36), 36), 10), '123456789012345678901234567890');
  assert.equal(group('11110000', 4), '1111 0000');
  assert.equal(bitLength(255n), 8);
  assert.equal(twosComplement(-1n, 8), '11111111');
  assert.equal(twosComplement(300n, 8), null);
  assert.throws(() => parseBigInt('12a', 10));
});

test('schema validation', () => {
  const schema = { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, age: { type: 'integer', minimum: 0 } }, required: ['name'], additionalProperties: false };
  assert.equal(validateWithSchema(schema, { name: 'a', age: 3 }).valid, true);
  const r = validateWithSchema(schema, { age: -1, email: 'nope', extra: 1 });
  assert.equal(r.valid, false);
  const msgs = r.issues.map((i) => `${i.path} ${i.keyword}`);
  for (const m of [' required', ' additionalProperties', '/age minimum', '/email format']) assert.ok(msgs.includes(m), m);
  // LLM wrappers and 2020-12
  const wrapped = { type: 'json_schema', json_schema: { name: 'x', strict: true, schema: { $schema: 'https://json-schema.org/draft/2020-12/schema', type: 'object', properties: { a: { type: 'number' } }, required: ['a'] } } };
  const w = validateWithSchema(wrapped, { a: 'x' });
  assert.equal(w.draft, '2020-12');
  assert.equal(w.issues[0].path, '/a');
});
