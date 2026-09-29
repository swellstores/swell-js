import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { stringify } from 'qs';
import { stringifyQuery } from '../src/utils';

const shared = { name: 'shared' };
const cases = [
  ['nested filters', { where: { price: { $gt: 5 }, active: true } }],
  ['indexed arrays', { ids: ['a', 'b'] }],
  ['objects in arrays', { items: [{ id: 'a' }, { id: 'b' }] }],
  ['nested arrays', { ids: [['a'], ['b', 'c']] }],
  ['sparse arrays', { ids: Object.assign(new Array(4), { 1: 'a', 3: 'b' }) }],
  ['null and undefined', { a: null, b: undefined, c: '' }],
  ['empty containers', { a: {}, b: [], c: { d: [] } }],
  ['date', { date: new Date('2026-09-29T12:00:00Z') }],
  ['root date', new Date('2026-09-29T12:00:00Z')],
  ['cross-realm date', { date: runInNewContext('new Date(0)') }],
  ['numbers', { a: 0, b: -0, c: -1.25, d: NaN, e: Infinity, f: -Infinity }],
  ['booleans', { a: true, b: false }],
  ['bigint and symbol', { a: BigInt(42), b: Symbol('test') }],
  ['functions', { a() {}, b: undefined }],
  ['function properties', { a: Object.assign(() => {}, { id: 1 }) }],
  ['root function', Object.assign(() => {}, { id: 1 })],
  ['root string', 'abc'],
  ['root number', 42],
  ['root null', null],
  ['root undefined', undefined],
  ['root array', ['a', 'b']],
  [
    'boxed values',
    { a: new String('ab'), b: new Number(3), c: new Boolean(false) },
  ],
  ['null-prototype object', Object.assign(Object.create(null), { a: 1 })],
  ['Buffer', { a: Buffer.from('abc'), b: Buffer.from([0, 255]) }],
  ['typed arrays', { a: new Uint8Array([1, 2]) }],
  ['non-enumerable containers', { a: new Map([['a', 1]]), b: /test/ }],
  ['shared references', { a: shared, b: shared }],
  ['key ordering', { b: 1, 2: 'two', 1: 'one', '': 'empty', a: 2 }],
  ['key punctuation', { 'a[b]': 'c d', 'a.b': "!*'()~-_.", $gt: 1 }],
  ['unicode', { 'é😀': 'こんにちは \u0000 é 😀' }],
  ['lone surrogates', { '\uD800': '\uDC00', a: '\uD800', b: '\uD800x' }],
  ['encoder boundary', { a: 'a'.repeat(1023) + '😀' }],
  ['malformed boundary', { a: 'a'.repeat(1023) + '\uDC00x' }],
  ['long string', { a: '😀é'.repeat(800) }],
  ['existing utility example', { a: '1', b: [2, 3], c: { d: true } }],
  ['existing product query', { price: { $gt: 0 } }],
];

describe('default query serialization parity with qs 6.16.0', () => {
  test.each(cases)('%s', (_name, value) => {
    expect(stringifyQuery(value)).toBe(stringify(value));
  });

  test('uses Date.prototype rather than an overridden toISOString', () => {
    const date = new Date(0);
    date.toISOString = () => 'overridden';
    expect(stringifyQuery({ date })).toBe(stringify({ date }));
  });

  test('preserves error classes', () => {
    const direct = {};
    direct.self = direct;
    const indirect = { child: {} };
    indirect.child.parent = indirect;
    const array = [];
    array.push(array);
    for (const value of [
      direct,
      indirect,
      { array },
      { date: new Date(NaN) },
    ]) {
      expect(() => stringify(value)).toThrow(RangeError);
      expect(() => stringifyQuery(value)).toThrow(RangeError);
    }
  });
});

describe('qs license notice', () => {
  test('is carried by every built output', () => {
    const dist = join(__dirname, '../dist');
    const esm = readdirSync(dist)
      .filter((file) => file.endsWith('.mjs'))
      .map((file) => readFileSync(join(dist, file), 'utf8'))
      .join('\n');
    for (const source of [
      readFileSync(join(__dirname, '../src/utils/stringify-query.js'), 'utf8'),
      esm,
      readFileSync(join(dist, 'swell.cjs'), 'utf8'),
      readFileSync(join(dist, 'swell.umd.min.js'), 'utf8'),
    ]) {
      expect(source).toMatch(/@license BSD-3-Clause/);
      expect(source).toMatch(/Copyright \(c\) 2014, Nathan LaFreniere/);
      expect(source).toMatch(
        /THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS/,
      );
    }
  });
});

describe.each(['index.mjs', 'swell.cjs', 'swell.umd.min.js'])(
  '%s query contract',
  (entry) => {
    let swell;
    beforeAll(() => {
      const loaded = require(`../dist/${entry}`);
      swell = loaded.default || loaded;
    });

    test.each(cases)('%s', (_name, value) => {
      expect(swell.utils.stringifyQuery(value)).toBe(stringify(value));
    });

    test('preserves product, cart and account GET query bytes', async () => {
      const client = swell.create('test', 'public', {
        getCookie: () => undefined,
        setCookie: () => {},
      });
      const products = { where: { price: { $gt: 5 } }, limit: 10 };
      await client.products.list(products);
      client.cart.clearCache();
      await client.cart.get();
      const account = {
        expand: ['addresses', 'orders'],
        fields: { name: true },
      };
      await client.account.get(account);
      const expected = [
        ['/products', products],
        ['/cart', { $cache: false }],
        ['/account', account],
      ];
      expect(fetch.mock.calls).toHaveLength(expected.length);
      expected.forEach(([pathname, query], index) => {
        expect(fetch.mock.calls[index][0]).toBe(
          `https://test.swell.store/api${pathname}?${stringify(query)}`,
        );
      });
    });
  },
);
