global.fetch = require('jest-fetch-mock');
global.window = {};

const api = require('./api');
const utils = require('./utils');

describe('utils', () => {
  let script;

  beforeEach(() => {
    api.init('test', 'pk_test');
    // Mock document
    global.document = {
      createElement: (tag) => {
        script = {
          parentNode: {
            removeChild: () => {},
          },
        };
        setTimeout(() => {
          window[`swell_vault_response_${window.__swell_vault_request_id}`]({ $data: { ok: 1 } });
        }, 100);
        return script;
      },
      getElementsByTagName: (tag) => {
        return [{ appendChild: (el) => {} }];
      },
    };
  });

  describe('init', () => {
    describe('vaultRequest', () => {
      it('should make a fetch request with vaultUrl', async () => {
        await utils.vaultRequest('post', '/tokens');

        expect(script.src).toEqual(
          'https://vault.schema.io/tokens?%24jsonp%5Bmethod%5D=post&%24jsonp%5Bcallback%5D=swell_vault_response_1&%24data=&%24key=pk_test',
        );
      });
    });
  });

  describe('toCamel', () => {
    it('should preserve $ prefixed keys', () => {
      const obj = utils.toCamel({ $cache: true, other_stuff: true });
      expect(obj).toEqual({
        $cache: true,
        otherStuff: true,
      });
    });

    it('should preserve deep $ prefixed keys', () => {
      const obj = utils.toCamel({ $cache: true, other_stuff: true, obj: { $locale: true } });
      expect(obj).toEqual({
        $cache: true,
        otherStuff: true,
        obj: { $locale: true }
      });
    });

    it('should not break arrays', () => {
      const obj = utils.toCamel([{ quantity_value: 1 }]);
      expect(obj).toEqual([{ quantityValue: 1 }]);
    });
  });

  describe('toSnake', () => {
    it('should preserve $ prefixed keys', () => {
      const obj = utils.toSnake({ $cache: true, otherStuff: true });
      expect(obj).toEqual({
        $cache: true,
        other_stuff: true,
      });
    });

    it('should preserve deep $ prefixed keys', () => {
      const obj = utils.toSnake({ $cache: true, otherStuff: true, obj: { $locale: true } });
      expect(obj).toEqual({
        $cache: true,
        other_stuff: true,
        obj: { $locale: true },
      });
    });

    it('should not break arrays', () => {
      const obj = utils.toSnake([{ quantityValue: 1 }]);
      expect(obj).toEqual([{ quantity_value: 1 }]);
    });

    it('should handle _[num] correctly', () => {
      const obj1 = utils.toSnake([{ address1: 1 }]);
      expect(obj1).toEqual([{ address1: 1 }]);
      const obj2 = utils.toSnake([{ address1Test: 1 }]);
      expect(obj2).toEqual([{ address1_test: 1 }]);
      const obj3 = utils.toSnake([{ address1Test2: 1 }]);
      expect(obj3).toEqual([{ address1_test2: 1 }]);
    });
  });

  describe('stringifyQuery', () => {
    it('should preserve $ prefixed keys', () => {
      const str = utils.stringifyQuery({ $cache: true, other_stuff: true });
      expect(str).toEqual('$cache=true&other_stuff=true');
    });
  });
});
