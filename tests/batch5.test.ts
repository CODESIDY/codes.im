import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODELS, estimateCost, formatUsd, formatTokens } from '../src/lib/llm-pricing.ts';
import { compare, parseVector, cosine, normalize } from '../src/lib/vector.ts';
import { applySymbolic, fromOctal, fromSymbolic, toAssignment, toOctal, toSymbolic } from '../src/lib/chmod.ts';
import { convertCase, convertLines, splitWords } from '../src/lib/case.ts';
import { query } from '../src/lib/jsonpath.ts';
import { canonical, diffJson, summarize } from '../src/lib/json-diff.ts';
import { base64Size, fitSize, formatBytes, parseDataUri, savedPercent, snippet } from '../src/lib/image.ts';

const model = (id: string) => MODELS.find((m) => m.id === id)!;

test('llm cost estimate', () => {
  const m = model('claude-sonnet-5-5'); // $2 in, $0.10 cached, $10 out
  const c = estimateCost(m, { inputTokens: 1_000_000, outputTokens: 100_000, requestsPerDay: 10 });
  assert.equal(c.perRequest, 3);
  assert.equal(c.perDay, 30);
  assert.equal(c.perMonth, 900);
  const cached = estimateCost(m, { inputTokens: 1_000_000, outputTokens: 0, cachedShare: 0.5 });
  assert.ok(Math.abs(cached.perRequest - 1.05) < 1e-9);
  assert.equal(cached.overContext, false);
  assert.equal(estimateCost(m, { inputTokens: 990_000, outputTokens: 20_000 }).overContext, true);
});

test('llm cost long-context tier', () => {
  const h = model('claude-haiku-5-5');
  assert.equal(estimateCost(h, { inputTokens: 100_000, outputTokens: 0 }).longTier, false);
  const long = estimateCost(h, { inputTokens: 200_000, outputTokens: 0 });
  assert.equal(long.longTier, true);
  assert.ok(Math.abs(long.perRequest - 0.1) < 1e-9);
  for (const m of MODELS) assert.ok(m.input > 0 && m.output >= m.input, m.id);
  assert.equal(new Set(MODELS.map((m) => m.id)).size, MODELS.length);
});

test('format usd and tokens', () => {
  assert.equal(formatUsd(0), '$0');
  assert.equal(formatUsd(0.00012), '$0.00012');
  assert.equal(formatUsd(0.001), '$0.001');
  assert.equal(formatUsd(3), '$3.00');
  assert.equal(formatUsd(1234.5), '$1,235');
  assert.equal(formatTokens(1_050_000), '1.05M');
  assert.equal(formatTokens(128_000), '128K');
});

test('vector parsing and similarity', () => {
  assert.deepEqual(parseVector('1, 2, 3'), [1, 2, 3]);
  assert.deepEqual(parseVector('[0.5 -1e-2]'), [0.5, -0.01]);
  assert.deepEqual(parseVector('{"data":[{"embedding":[1,0]}]}'), [1, 0]);
  assert.deepEqual(parseVector('{"embedding":{"values":[0,1]}}'), [0, 1]);
  assert.throws(() => parseVector('1, x'), /not a number/);
  const r = compare([1, 0], [0, 1]);
  assert.equal(r.cosine, 0);
  assert.equal(Math.round(r.angle), 90);
  assert.equal(r.euclidean, Math.SQRT2);
  assert.equal(r.manhattan, 2);
  assert.ok(Math.abs(cosine([1, 2, 3], [2, 4, 6]) - 1) < 1e-12);
  assert.throws(() => compare([1], [1, 2]), /Dimension mismatch/);
  assert.deepEqual(normalize([3, 4]), [0.6, 0.8]);
});

test('chmod conversions', () => {
  const p = fromOctal('755');
  assert.equal(toSymbolic(p), 'rwxr-xr-x');
  assert.equal(toAssignment(p), 'u=rwx,g=rx,o=rx');
  assert.equal(toOctal(fromSymbolic('-rw-r--r--')), '644');
  assert.equal(toSymbolic(fromOctal('4755')), 'rwsr-xr-x');
  assert.equal(toSymbolic(fromOctal('1777')), 'rwxrwxrwt');
  assert.equal(toSymbolic(fromOctal('2644')), 'rw-r-Sr--');
  assert.equal(toOctal(fromSymbolic('drwxrwxrwt')), '1777');
  assert.equal(toOctal(applySymbolic(fromOctal('644'), 'u+x,go-r')), '700');
  assert.equal(toOctal(applySymbolic(fromOctal('000'), 'a=r,u+w')), '644');
  assert.equal(toOctal(applySymbolic(fromOctal('755'), 'u+s')), '4755');
  assert.throws(() => fromOctal('8'), /Octal/);
  assert.throws(() => applySymbolic(fromOctal('755'), 'z+x'), /Invalid/);
});

test('case conversion', () => {
  assert.deepEqual(splitWords('XMLHttpRequest'), ['xml', 'http', 'request']);
  assert.deepEqual(splitWords('userID2'), ['user', 'id', '2']);
  assert.deepEqual(splitWords('  hello-world_foo.bar '), ['hello', 'world', 'foo', 'bar']);
  assert.equal(convertCase('user_first_name', 'camel'), 'userFirstName');
  assert.equal(convertCase('userFirstName', 'pascal'), 'UserFirstName');
  assert.equal(convertCase('UserFirstName', 'snake'), 'user_first_name');
  assert.equal(convertCase('userFirstName', 'constant'), 'USER_FIRST_NAME');
  assert.equal(convertCase('user first name', 'kebab'), 'user-first-name');
  assert.equal(convertCase('user_first_name', 'train'), 'User-First-Name');
  assert.equal(convertCase('getHTTPResponse', 'title'), 'Get Http Response');
  assert.equal(convertCase('HELLO_WORLD', 'sentence'), 'Hello world');
  assert.equal(convertLines('fooBar\n\nbaz_qux', 'kebab'), 'foo-bar\n\nbaz-qux');
});

const store = {
  store: {
    book: [
      { category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
      { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
      { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', isbn: '0-553-21311-3', price: 8.99 },
      { category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', isbn: '0-395-19395-8', price: 22.99 },
    ],
    bicycle: { color: 'red', price: 399 },
  },
  'weird key': 1,
};

test('jsonpath basics', () => {
  const v = (p: string) => query(store, p).map((m) => m.value);
  assert.deepEqual(v('$.store.book[*].author').length, 4);
  assert.deepEqual(v('$..author')[0], 'Nigel Rees');
  assert.deepEqual(v('$.store.book[-1].title'), ['The Lord of the Rings']);
  assert.deepEqual(v('$.store.book[0,1].price'), [8.95, 12.99]);
  assert.deepEqual(v('$.store.book[:2].price'), [8.95, 12.99]);
  assert.deepEqual(v('$.store.book[::-1][0].price'), []); // slice result is a list of nodes, [0] then applies to each book
  assert.deepEqual(v('$.store.book[::2].price'), [8.95, 8.99]);
  assert.deepEqual(v("$['weird key']"), [1]);
  assert.deepEqual(v('$..price').length, 5);
  assert.deepEqual(v('$.store.*').length, 2);
  assert.equal(query(store, '$.store.book[0].title')[0].path, "$['store']['book'][0]['title']");
});

test('jsonpath filters', () => {
  const v = (p: string) => query(store, p).map((m) => m.value);
  assert.deepEqual(v('$.store.book[?(@.price < 10)].title'), ['Sayings of the Century', 'Moby Dick']);
  assert.deepEqual(v('$.store.book[?@.isbn].title').length, 2);
  assert.deepEqual(v("$.store.book[?(@.category == 'fiction' && @.price > 20)].author"), ['J. R. R. Tolkien']);
  assert.deepEqual(v('$.store.book[?(!@.isbn)].price'), [8.95, 12.99]);
  assert.deepEqual(v('$.store.book[?(@.author =~ /^h/i)].title'), ['Moby Dick']);
  assert.deepEqual(v('$..book[?(@.price > $.store.bicycle.price)]'), []);
  assert.throws(() => query(store, 'store.book'), /must start with \$/);
  assert.throws(() => query(store, '$.store.book[?(@.price <)]'), /position/);
});

test('json diff', () => {
  const a = { id: 1, name: 'a', tags: ['x', 'y'], nested: { v: 1 }, gone: true };
  const b = { id: 1, name: 'b', tags: ['x', 'y', 'z'], nested: { v: 2 }, 'new key': 0 };
  const d = diffJson(a, b);
  assert.deepEqual(
    d.map((c) => `${c.kind} ${c.path}`),
    ['changed $.name', 'added $.tags[2]', 'changed $.nested.v', 'removed $.gone', 'added $["new key"]'],
  );
  assert.deepEqual(summarize(d), { added: 2, removed: 1, changed: 2 });
  assert.equal(diffJson({ a: [1, 2, 3] }, { a: [3, 1, 2] }, { ignoreArrayOrder: true }).length, 0);
  assert.equal(diffJson([{ a: 1, b: 2 }], [{ b: 2, a: 1 }]).length, 0);
  assert.equal(diffJson({ x: 0.1 + 0.2 }, { x: 0.3 }, { epsilon: 1e-9 }).length, 0);
  assert.equal(canonical({ b: 1, a: { d: 1, c: 2 } }, 0), '{"a":{"c":2,"d":1},"b":1}');
});

test('image helpers', () => {
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.deepEqual(fitSize(4000, 3000, 1920), { width: 1920, height: 1440 });
  assert.deepEqual(fitSize(800, 600, 1920, 1080), { width: 800, height: 600 });
  assert.deepEqual(fitSize(1000, 4000, 0, 1000), { width: 250, height: 1000 });
  assert.equal(savedPercent(1000, 250), 75);
  assert.deepEqual(parseDataUri('data:image/png;base64,AAAA'), { mime: 'image/png', base64: true, data: 'AAAA' });
  assert.equal(base64Size('AAAA'), 3);
  assert.equal(base64Size('AA=='), 1);
  assert.equal(snippet('css', 'data:image/png;base64,AA=='), 'background-image: url("data:image/png;base64,AA==");');
  assert.match(snippet('json', 'data:image/png;base64,AA=='), /"media_type": "image\/png"/);
});

test('share state round-trip', async () => {
  const { encodeState, decodeState } = await import('../src/lib/share-state.ts');
  const state = { '#in': '{"a":1}\n中文 ✓', 'mode=decode': true, '#q': '' };
  const enc = await encodeState(state);
  assert.match(enc, /^z[A-Za-z0-9_-]+$/);
  assert.deepEqual(await decodeState(enc), state);
  await assert.rejects(() => decodeState('xabc'), /Unknown share format/);
});
