global.fetch = require('jest-fetch-mock');

const api = require('./api');

describe('card', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
  });

  describe('init', () => {
    it('should set options', () => {
      api.init('test1', 'pk_test1');
      expect(api.card.options).toEqual({
        vaultUrl: 'https://vault.schema.io',
      });
    });

    it('should set vault url from options', () => {
      api.init('test2', 'pk_test2', {
        vaultUrl: 'https://examplevault.com',
      });
      expect(api.card.options).toEqual({
        vaultUrl: 'https://examplevault.com',
      });
    });

    describe('vaultRequest', () => {
      it('should make a fetch request with vaultUrl', async () => {
        await api.card.vaultRequest('post', '/tokens');

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual('https://vault.schema.io/tokens');
        expect(fetch.mock.calls[0][1]).toHaveProperty(
          'headers',
          new Headers({
            'Content-Type': `application/json`,
            Authorization: `Basic ${Buffer.from('pk_test').toString('base64')}`,
          }),
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

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://vault.schema.io/tokens`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
        expect(fetch.mock.calls[0][1]).toHaveProperty(
          'body',
          JSON.stringify({
            number: '4242 4242 4242 4242',
            exp_month: 1,
            exp_year: 2099,
            cvc: 123,
          }),
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
      it('should do stuff', async () => {

      });
    });

    describe('validateExpiry', () => {
      it('should do stuff', async () => {

      });
    });

    describe('validateCVC', () => {
      it('should do stuff', async () => {

      });
    });
  });
});
