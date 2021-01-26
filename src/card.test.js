global.fetch = require('jest-fetch-mock');
global.window = {};

import api from './api';

let VAULT_RESPONSE;

describe('card', () => {
  let script;

  beforeEach(() => {
    api.init('test', 'pk_test');
    VAULT_RESPONSE = null;
    // Mock document
    global.document = {
      createElement: (tag) => {
        script = {
          parentNode: {
            removeChild: () => {},
          },
        };
        setTimeout(() => {
          window[`swell_vault_response_${window.__swell_vault_request_id}`]({
            $data: VAULT_RESPONSE || { token: 't_test' },
          });
        }, 100);
        return script;
      },
      getElementsByTagName: (tag) => {
        return [{ appendChild: (el) => {} }];
      },
    };
  });

  describe('init', () => {
    describe('createToken', () => {
      it('should make request to POST /tokens', async () => {
        await api.card.createToken({
          number: '4242 4242 4242 4242',
          exp_month: 1,
          exp_year: 2099,
          cvc: 123,
        });

        expect(script.src).toEqual(
          'https://vault.schema.io/tokens?%24jsonp%5Bmethod%5D=post&%24jsonp%5Bcallback%5D=swell_vault_response_1&%24data%5Bnumber%5D=4242%204242%204242%204242&%24data%5Bexp_month%5D=1&%24data%5Bexp_year%5D=2099&%24data%5Bcvc%5D=123&%24key=pk_test',
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

      it('should throw an of vault request returns errors', async () => {
        try {
          VAULT_RESPONSE = { errors: { gateway: { code: 'INVALID', message: 'Test error' } } };
          await api.card.createToken({
            cvc: 123,
            exp_month: 1,
            exp_year: 2099,
            number: '4242 4242 4242 4242',
          });
          throw new Error();
        } catch (err) {
          expect(err.message).toEqual('Test error');
          expect(err.param).toEqual('gateway');
          expect(err.status).toEqual(402);
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
