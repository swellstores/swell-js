global.fetch = require('jest-fetch-mock');

const api = require('./api');

describe('api', () => {
  beforeEach(() => {
    api.auth('test', 'pk_test');
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
  });

  describe('auth', () => {
    it('should set options', () => {
      api.auth('test1', 'pk_test1');
      expect(api.options).toEqual({
        store: 'test1',
        key: 'pk_test1',
        url: 'https://test1.swell.store',
        useCamelCase: false,
      });
    });

    it('should set url from options', () => {
      api.auth('test2', 'pk_test2', {
        url: 'https://www.test2.com',
      });
      expect(api.options).toEqual({
        store: 'test2',
        key: 'pk_test2',
        url: 'https://www.test2.com',
        useCamelCase: false,
      });
    });
  });

  describe('request', () => {
    it('should make a fetch request with headers', async () => {
      await api.request('get', '/test');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'headers',
        new Headers({
          'Content-Type': `application/json`,
          Authorization: `Basic ${Buffer.from('pk_test').toString('base64')}`,
        }),
      );
    });

    it('should make a fetch request with credentials', async () => {
      await api.request('get', '/test');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][1]).toHaveProperty('credentials', 'include');
    });

    it('should make a fetch request with cors', async () => {
      await api.request('get', '/test');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][1]).toHaveProperty('mode', 'cors');
    });

    it('should trim url', async () => {
      const result = await api.request('get', '///test///');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('https://test.swell.store/api/test');
    });

    it('should parse json response', async () => {
      fetch.mockResponseOnce(JSON.stringify({ data: '123' }));

      const result = await api.request('get', '/test');

      expect(result).toEqual({ data: '123' });
    });

    it('should encode json body by method', async () => {
      await api.request('get', '/test', { data: '123' });
      expect(fetch.mock.calls[0][1]).toHaveProperty('body', undefined);

      await api.request('put', '/test', { data: '123' });
      expect(fetch.mock.calls[1][1]).toHaveProperty('body', JSON.stringify({ data: '123' }));

      await api.request('post', '/test', { data: '123' });
      expect(fetch.mock.calls[2][1]).toHaveProperty('body', JSON.stringify({ data: '123' }));

      await api.request('delete', '/test', { data: '123' });
      expect(fetch.mock.calls[3][1]).toHaveProperty('body', JSON.stringify({ data: '123' }));
    });
  });

  describe('get', () => {
    it('should make a GET request', async () => {
      await api.get('/test');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('https://test.swell.store/api/test');
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should make a GET request with query string', async () => {
      await api.get('/test', { foo: 'bar' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('https://test.swell.store/api/test?foo=bar');
    });

    it('should make a GET request with ID', async () => {
      await api.get('/test', '12345');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('https://test.swell.store/api/test/12345');
    });

    it('should make a GET request with merged query string', async () => {
      await api.get('/test?one=two', { foo: 'bar' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('https://test.swell.store/api/test?one=two&foo=bar');
    });

    it('should make a GET request with complex query string', async () => {
      await api.get('/test?one=two', { foo: [{ id: 1 }, { id: 2 }] });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        'https://test.swell.store/api/test?one=two&foo[0][id]=1&foo[1][id]=2',
      );
    });
  });

  describe('put', () => {
    it('should make a PUT request', async () => {
      await api.put('/test', { foo: 'bar' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('https://test.swell.store/api/test');
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
    });
  });

  describe('post', () => {
    it('should make a POST request', async () => {
      await api.post('/test', { foo: 'bar' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('https://test.swell.store/api/test');
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
    });
  });

  describe('delete', () => {
    it('should make a POST request', async () => {
      await api.delete('/test', { foo: 'bar' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('https://test.swell.store/api/test');
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
    });
  });

  // Test standard models
  ['products', 'categories'].forEach((model) => {
    describe(model, () => {
      describe('get', () => {
        it(`should make request to GET /${model}`, async () => {
          await api[model].get();

          expect(fetch.mock.calls.length).toEqual(1);
          expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/${model}`);
          expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
        });

        it(`should make request to GET /${model} with query`, async () => {
          await api[model].get({ limit: 10, page: 1 });

          expect(fetch.mock.calls.length).toEqual(1);
          expect(fetch.mock.calls[0][0]).toEqual(
            `https://test.swell.store/api/${model}?limit=10&page=1`,
          );
        });

        it(`should make request to GET /${model}/id`, async () => {
          await api[model].get('12345');

          expect(fetch.mock.calls.length).toEqual(1);
          expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/${model}/12345`);
        });

        it(`should make request to GET /${model}/id?query`, async () => {
          await api[model].get('12345', { query: '123' });

          expect(fetch.mock.calls.length).toEqual(1);
          expect(fetch.mock.calls[0][0]).toEqual(
            `https://test.swell.store/api/${model}/12345?query=123`,
          );
        });
      });
    });
  });

  describe('cart', () => {
    describe('get', () => {
      it('should make request to GET /cart', async () => {
        await api.cart.get();

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
      });

      it('should register response state', async () => {
        fetch.mockResponseOnce(JSON.stringify({ grand_total: 1000 }));
        await api.cart.get();
        expect(api.cart.state).toEqual({ grand_total: 1000 });
      });
    });

    describe('addItem', () => {
      it('should make request to POST /cart/items', async () => {
        await api.cart.addItem({ product_id: '123' });

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
        expect(fetch.mock.calls[0][1]).toHaveProperty(
          'body',
          JSON.stringify({ product_id: '123' }),
        );
      });
    });

    describe('setItems', () => {
      it('should make request to PUT /cart/items', async () => {
        await api.cart.setItems([{ quantity: 2 }]);

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
        expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify([{ quantity: 2 }]));
      });
    });

    describe('updateItem', () => {
      it('should make request to PUT /cart/items/id', async () => {
        await api.cart.updateItem('12345', { quantity: 2 });

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items/12345`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
        expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify({ quantity: 2 }));
      });
    });

    describe('removeItem', () => {
      it('should make request to DELETE /cart/items/id', async () => {
        await api.cart.removeItem('12345');

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items/12345`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
      });
    });

    describe('recover', () => {
      it('should make request to PUT /cart/recover/id', async () => {
        await api.cart.recover('12345');

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/recover/12345`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      });
    });
  });

  describe('subscriptions', () => {
    describe('get', () => {
      it('should make request to GET /subscriptions', async () => {
        await api.subscriptions.get();

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
      });

      it('should make request to GET /subscriptions/id', async () => {
        await api.subscriptions.get('12345');

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions/12345`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
      });
    });

    describe('create', () => {
      it('should make request to POST /subscriptions', async () => {
        await api.subscriptions.create({ product_id: '123' });

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
        expect(fetch.mock.calls[0][1]).toHaveProperty(
          'body',
          JSON.stringify({ product_id: '123' }),
        );
      });
    });

    describe('update', () => {
      it('should make request to PUT /subscriptions/id', async () => {
        await api.subscriptions.update('12345', { product_id: '123' });

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions/12345`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
        expect(fetch.mock.calls[0][1]).toHaveProperty(
          'body',
          JSON.stringify({ product_id: '123' }),
        );
      });
    });

    describe('addItem', () => {
      it('should make request to POST /subscriptions/id/items', async () => {
        await api.subscriptions.addItem('12345', { product_id: '123' });

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions/12345/items`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
        expect(fetch.mock.calls[0][1]).toHaveProperty(
          'body',
          JSON.stringify({ product_id: '123' }),
        );
      });
    });

    describe('setItems', () => {
      it('should make request to PUT /subscriptions/id/items', async () => {
        await api.subscriptions.setItems('12345', [{ quantity: 2 }]);

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions/12345/items`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
        expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify([{ quantity: 2 }]));
      });
    });

    describe('updateItem', () => {
      it('should make request to PUT /subscriptions/id/items/id', async () => {
        await api.subscriptions.updateItem('12345', '67890', { quantity: 2 });

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions/12345/items/67890`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
        expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify({ quantity: 2 }));
      });
    });

    describe('removeItem', () => {
      it('should make request to DELETE /subscriptions/id/items/id', async () => {
        await api.subscriptions.removeItem('12345', '67890');

        expect(fetch.mock.calls.length).toEqual(1);
        expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions/12345/items/67890`);
        expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
      });
    });
  });

  describe('account', () => {
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
  });

  describe('options.useCamelCase', () => {
    it('should convert response keys to camcel case', async () => {
      fetch.resetMocks();
      fetch.mockResponse(JSON.stringify({ test_one: true, test_two: true }));
      api.auth('test', 'pk_test', { useCamelCase: true });

      const response = await api.account.get();
      expect(response).toEqual({ testOne: true, testTwo: true });
    });

    it('should not mutate request data object', async () => {
      fetch.resetMocks();
      fetch.mockResponse(JSON.stringify({ test_one: true, test_two: true }));
      api.auth('test', 'pk_test', { useCamelCase: true });

      const data = { query_test: true };
      const response = await api.account.get(data);
      expect(data).toEqual({ query_test: true });
    });
  });
});
