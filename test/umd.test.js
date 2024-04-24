'use strict';

const SWELL_STORE_ID = 'test';
const SWELL_PUBLIC_KEY = '...';

describe('swell-js umd', () => {
  /** @type {import('../types/index.js')} */
  let swell;

  beforeAll(() => {
    swell = require('../dist/swell.umd.min.js');
  });

  it('should initialize and work without errors', async () => {
    swell.init(SWELL_STORE_ID, SWELL_PUBLIC_KEY, { useCamelCase: true });

    await swell.products.list({ price: { $gt: 0 } });

    expect(swell.utils.round(10.1234, 3)).toStrictEqual(10.123);

    expect(
      swell.utils.stringifyQuery({ a: '1', b: [2, 3], c: { d: true } }),
    ).toStrictEqual('a=1&b%5B0%5D=2&b%5B1%5D=3&c%5Bd%5D=true');
  });
});
