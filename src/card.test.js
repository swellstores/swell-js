import api from './api';

describe('card', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('init', () => {
    describe('createToken', () => {
      it('should make request to POST /tokens', async () => {
        fetch.mockResponse(JSON.stringify({ $data: { token: 't_test' } }));

        await api.card.createToken({
          number: '4242 4242 4242 4242',
          exp_month: 1,
          exp_year: 2099,
          cvc: 123,
        });

        expect(fetch).toHaveBeenCalledWith(
          'https://vault.schema.io/tokens?%24jsonp%5Bmethod%5D=post&%24jsonp%5Bcallback%5D=none&%24data%5Bnumber%5D=4242%204242%204242%204242&%24data%5Bexp_month%5D=1&%24data%5Bexp_year%5D=2099&%24data%5Bcvc%5D=123&%24key=pk_test',
          expect.objectContaining({
            signal: expect.any(Object),
          }),
        );
      });

      it('should throw an error if card cvc code is invalid', async () => {
        await expect(
          api.card.createToken({
            cvc: 1,
          }),
        ).rejects.toThrow('Card CVC code appears to be invalid');
      });

      it('should throw an error if card expiry is invalid', async () => {
        await expect(
          api.card.createToken({
            cvc: 123,
            exp_month: 100,
          }),
        ).rejects.toThrow('Card expiry appears to be invalid');
      });

      it('should throw an error if card number is invalid', async () => {
        await expect(
          api.card.createToken({
            cvc: 123,
            exp_month: 1,
            exp_year: 2099,
            number: '1',
          }),
        ).rejects.toThrow('Card number appears to be invalid');
      });

      it('should throw an of vault request returns errors', async () => {
        fetch.mockResponse(
          JSON.stringify({
            $data: {
              errors: { gateway: { code: 'INVALID', message: 'Test error' } },
            },
          }),
        );

        await expect(
          api.card.createToken({
            cvc: 123,
            exp_month: 1,
            exp_year: 2099,
            number: '4242 4242 4242 4242',
          }),
        ).rejects.toThrow('Test error');
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
