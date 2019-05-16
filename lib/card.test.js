global.fetch = require('jest-fetch-mock');
global.window = {};

const api = require('./api');

describe('card', () => {
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
    it('should set options', () => {
      api.init('test1', 'pk_test1');
      expect(api.card.options).toEqual({
        vaultUrl: 'https://vault.schema.io',
        key: 'pk_test1',
        timeout: 20000,
        useCamelCase: false,
      });
    });

    it('should set vault url from options', () => {
      api.init('test2', 'pk_test2', {
        vaultUrl: 'https://examplevault.com',
      });
      expect(api.card.options).toEqual({
        vaultUrl: 'https://examplevault.com',
        key: 'pk_test2',
        timeout: 20000,
        useCamelCase: false,
      });
    });

    describe('vaultRequest', () => {
      it('should make a fetch request with vaultUrl', async () => {
        await api.card.vaultRequest('post', '/tokens');

        expect(script.src).toEqual(
          'https://vault.schema.io/tokens?%24jsonp%5Bmethod%5D=post&%24jsonp%5Bcallback%5D=swell_vault_response_1&%24data=&%24key=pk_test',
        );
      });
    });

    describe('createToken', () => {
      it('should make request to POST /tokens', async () => {
        await api.card.createToken({
          number: '4242 4242 4242 4242',
          exp_month: 1,
          exp_year: 2099,
          cvc: 123,
        });

        expect(script.src).toEqual(
          'https://vault.schema.io/tokens?%24jsonp%5Bmethod%5D=post&%24jsonp%5Bcallback%5D=swell_vault_response_2&%24data%5Bnumber%5D=4242%204242%204242%204242&%24data%5Bexp_month%5D=1&%24data%5Bexp_year%5D=2099&%24data%5Bcvc%5D=123&%24key=pk_test',
        );
      });

      it('should throw an error if card cvc code is invalid', async () => {
        try {
          await api.card.createToken({
            cvc: 1,
          });
          throw new Error();
        } catch (err) {
          expect(err.message).toEqual('Card CVC code appears to be invalid');
        }
      });

      it('should throw an error if card expiry is invalid', async () => {
        try {
          await api.card.createToken({
            cvc: 123,
            exp_month: 100,
          });
          throw new Error();
        } catch (err) {
          expect(err.message).toEqual('Card expiry appears to be invalid');
        }
      });

      it('should throw an error if card number is invalid', async () => {
        try {
          await api.card.createToken({
            cvc: 123,
            exp_month: 1,
            exp_year: 2099,
            number: '1',
          });
          throw new Error();
        } catch (err) {
          expect(err.message).toEqual('Card number appears to be invalid');
        }
      });
    });

    describe('expiry', () => {
      it('should parse expiration string into parts', () => {
        const { month, year } = api.card.expiry('01/2099');

        expect(month).toEqual(1);
        expect(year).toEqual(2099);
      });
    });

    it('should return existing object', () => {
      const exp = api.card.expiry({ month: 1, year: 2099 });

      expect(exp).toEqual({ month: 1, year: 2099 });
    });

    describe('type', () => {
      it('should return correct type for a given card number', async () => {
        const type = api.card.type('4242 4242 4242 4242');

        expect(type).toEqual('Visa');
      });
    });

    describe('validateNumber', () => {
      it('should do stuff', async () => {});
    });

    describe('validateExpiry', () => {
      it('should do stuff', async () => {});
    });

    describe('validateCVC', () => {
      it('should do stuff', async () => {});
    });
  });
});
