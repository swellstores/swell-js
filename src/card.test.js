import api from './api';

describe('card', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('createToken', () => {
    it('should make request to POST /tokens', async () => {
      fetch.mockResponse(JSON.stringify({ $data: { token: 't_test' } }));

      await api.card.createToken({
        number: '4242 4242 4242 4242',
        exp_month: 1,
        exp_year: 2099,
        cvc: '098',
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://vault.schema.io/tokens?%24jsonp%5Bmethod%5D=post&%24jsonp%5Bcallback%5D=none&%24data%5Bnumber%5D=4242%204242%204242%204242&%24data%5Bexp_month%5D=1&%24data%5Bexp_year%5D=2099&%24data%5Bcvc%5D=098&%24key=pk_test',
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

    it('should return existing object', () => {
      const exp = api.card.expiry({ month: 1, year: 2099 });

      expect(exp).toEqual({ month: 1, year: 2099 });
    });
  });

  describe('type', () => {
    it('should return correct type for a given card number', async () => {
      const type = api.card.type('4242 4242 4242 4242');

      expect(type).toEqual('Visa');
    });
  });

  describe('validateNumber', () => {
    it('should validate card number', () => {
      expect(api.card.validateNumber(4242424242424242)).toStrictEqual(true);
      expect(api.card.validateNumber('4242424242424242')).toStrictEqual(true);

      expect(api.card.validateNumber('4242 4242 4242 4242')).toStrictEqual(
        true,
      );

      expect(api.card.validateNumber('5555 5555 5555 4444')).toStrictEqual(
        true,
      );
    });

    it('should not validate card number', () => {
      expect(api.card.validateNumber()).toStrictEqual(false);

      expect(api.card.validateNumber('1212')).toStrictEqual(false);

      expect(api.card.validateNumber('4242 4242 4242 4243')).toStrictEqual(
        false,
      );

      expect(api.card.validateNumber('5555 5555 5555 4445')).toStrictEqual(
        false,
      );

      expect(api.card.validateNumber('4242 4242 4242 4242 0')).toStrictEqual(
        false,
      );

      expect(api.card.validateNumber('4242 4242 4242 4242 42')).toStrictEqual(
        false,
      );
    });
  });

  describe('validateExpiry', () => {
    it('should validate card expiration date', () => {
      const year = new Date().getFullYear() + 1;

      expect(api.card.validateExpiry(9, year)).toStrictEqual(true);
      expect(api.card.validateExpiry('9', `${year}`)).toStrictEqual(true);
      expect(api.card.validateExpiry(' 9 ', ` ${year} `)).toStrictEqual(true);
    });

    it('should not validate card expiration date', () => {
      expect(api.card.validateExpiry()).toStrictEqual(false);
      expect(api.card.validateExpiry(11)).toStrictEqual(false);
      expect(api.card.validateExpiry(9, 2020)).toStrictEqual(false);
      expect(api.card.validateExpiry(13, 2020)).toStrictEqual(false);
      expect(api.card.validateExpiry(13, 9999)).toStrictEqual(false);
      expect(api.card.validateExpiry('||', 9999)).toStrictEqual(false);
      expect(api.card.validateExpiry(11, '||||')).toStrictEqual(false);
    });
  });

  describe('validateCVC', () => {
    it('should validate cvc', () => {
      expect(api.card.validateCVC('0000')).toStrictEqual(true);
      expect(api.card.validateCVC('0001')).toStrictEqual(true);
      expect(api.card.validateCVC('1234')).toStrictEqual(true);
      expect(api.card.validateCVC('000')).toStrictEqual(true);
      expect(api.card.validateCVC('001')).toStrictEqual(true);
      expect(api.card.validateCVC('987')).toStrictEqual(true);

      expect(api.card.validateCVC(5678)).toStrictEqual(true);
      expect(api.card.validateCVC(738)).toStrictEqual(true);
    });

    it('should not validate cvc', () => {
      expect(api.card.validateCVC('01234')).toStrictEqual(false);
      expect(api.card.validateCVC('01')).toStrictEqual(false);
      expect(api.card.validateCVC('1')).toStrictEqual(false);

      expect(api.card.validateCVC(12345)).toStrictEqual(false);
      expect(api.card.validateCVC(12)).toStrictEqual(false);
      expect(api.card.validateCVC(1)).toStrictEqual(false);
    });
  });
});
