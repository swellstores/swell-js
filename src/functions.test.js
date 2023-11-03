import api from './api';

describe('functions', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('request', () => {
    it('should make request to GET /functions/app_id/function_name?value=test', async () => {
      await api.functions.request('get', 'app_id', 'function_name', {
        value: 'test',
      });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/functions/app_id/function_name?value=test`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('get', () => {
    it('should make request to GET /functions/app_id/function_name?value=test', async () => {
      await api.functions.get('app_id', 'function_name', {
        value: 'test',
      });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/functions/app_id/function_name?value=test`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('put', () => {
    it('should make request to PUT /functions/app_id/function_name', async () => {
      await api.functions.put('app_id', 'function_name', {
        value: 'test',
      });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/functions/app_id/function_name`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ value: 'test' }),
      );
    });
  });

  describe('post', () => {
    it('should make request to POST /functions/app_id/function_name', async () => {
      await api.functions.post('app_id', 'function_name', {
        value: 'test',
      });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/functions/app_id/function_name`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ value: 'test' }),
      );
    });
  });

  describe('delete', () => {
    it('should make request to DELETE /functions/app_id/function_name', async () => {
      await api.functions.delete('app_id', 'function_name', {
        value: 'test',
      });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/functions/app_id/function_name`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ value: 'test' }),
      );
    });
  });
});
