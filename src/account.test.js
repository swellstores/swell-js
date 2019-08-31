const api = require('./api');

describe('account', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('get', () => {
    it('should make request to GET /account', async () => {
      await api.account.get();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should register response state', async () => {
      fetch.mockResponseOnce(JSON.stringify({ name: 'Someone' }));
      await api.account.get();
      expect(api.account.state).toEqual({ name: 'Someone' });
    });
  });

  describe('create', () => {
    it('should make request to POST /account', async () => {
      await api.account.create({ name: 'Test Account' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ name: 'Test Account' }),
      );
    });
  });

  describe('update', () => {
    it('should make request to PUT /account', async () => {
      await api.account.update({ name: 'Test Update' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ name: 'Test Update' }),
      );
    });
  });

  describe('login', () => {
    it('should make request to POST /account/login', async () => {
      await api.account.login();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/login`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
    });
  });

  describe('logout', () => {
    it('should make request to POST /account/logout', async () => {
      await api.account.logout();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/logout`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
    });
  });

  describe('recover', () => {
    it('should make request to POST /account/recover', async () => {
      await api.account.recover({ email: 'customer@example.com' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/recover`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ email: 'customer@example.com' }),
      );
    });
  });

  describe('getAddresses', () => {
    it('should make request to GET /account/addresses', async () => {
      await api.account.getAddresses();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/addresses`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('createAddress', () => {
    it('should make request to POST /account/addresses', async () => {
      await api.account.createAddress({ address1: 'Test street' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/addresses`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ address1: 'Test street' }),
      );
    });
  });

  describe('deleteAddress', () => {
    it('should make request to DELETE /account/addresses/id', async () => {
      await api.account.deleteAddress('12345');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/account/addresses/12345`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
    });
  });

  describe('getCards', () => {
    it('should make request to GET /account/cards', async () => {
      await api.account.getCards();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/cards`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('createCard', () => {
    it('should make request to POST /account/cards', async () => {
      await api.account.createCard({ token: 'tok_test' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/cards`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ token: 'tok_test' }),
      );
    });
  });

  describe('deleteCard', () => {
    it('should make request to DELETE /account/cards/id', async () => {
      await api.account.deleteCard('12345');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/cards/12345`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
    });
  });

  describe('getOrders', () => {
    it('should make request to GET /account/orders', async () => {
      await api.account.getOrders();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/orders`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should make request to GET /account/orders?page=2', async () => {
      await api.account.getOrders({ page: 2 });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/account/orders?page=2`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });
});
