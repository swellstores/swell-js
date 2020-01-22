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
});
