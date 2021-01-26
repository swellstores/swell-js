import api from './api';

describe('api', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('auth', () => {
    it('should call init() for backward compatibility', () => {
      api.auth('test1', 'pk_test1');
      expect(api.options).toEqual({
        previewContent: false,
        store: 'test1',
        key: 'pk_test1',
        timeout: 20000,
        url: 'https://test1.swell.store',
        vaultUrl: 'https://vault.schema.io',
        useCamelCase: false,
        api: api.options.api,
      });
    });
  });

  describe('init', () => {
    it('should set options', () => {
      api.init('test1', 'pk_test1');
      expect(api.options).toEqual({
        previewContent: false,
        store: 'test1',
        key: 'pk_test1',
        timeout: 20000,
        url: 'https://test1.swell.store',
        vaultUrl: 'https://vault.schema.io',
        useCamelCase: false,
        api: api.options.api,
      });
    });

    it('should set url from options', () => {
      api.init('test2', 'pk_test2', {
        url: 'https://www.test2.com',
      });
      expect(api.options).toEqual({
        previewContent: false,
        store: 'test2',
        key: 'pk_test2',
        timeout: 20000,
        url: 'https://www.test2.com',
        vaultUrl: 'https://vault.schema.io',
        useCamelCase: false,
        api: api.options.api,
      });
    });
  });

  describe('request', () => {
    it('should make a fetch request with headers', async () => {
      await api.request('get', '/test');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][1]).toHaveProperty('headers', {
        'Content-Type': `application/json`,
        Authorization: `Basic ${Buffer.from('pk_test').toString('base64')}`,
      });
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

  describe('options.useCamelCase', () => {
    it('should convert response keys to camcel case', async () => {
      fetch.resetMocks();
      fetch.mockResponse(JSON.stringify({ test_one: true, test_two: true }));
      api.init('test', 'pk_test', { useCamelCase: true });

      const response = await api.account.get();
      expect(response).toEqual({ testOne: true, testTwo: true });
    });

    it('should not mutate request data object', async () => {
      fetch.resetMocks();
      fetch.mockResponse(JSON.stringify({ test_one: true, test_two: true }));
      api.init('test', 'pk_test', { useCamelCase: true });

      const data = { query_test: true };
      const response = await api.account.get(data);
      expect(data).toEqual({ query_test: true });
    });
  });
});
