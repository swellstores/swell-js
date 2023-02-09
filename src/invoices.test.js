import api from './api';

describe('invoices', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('get', () => {
    it('should make request to GET /invoices', async () => {
      await api.invoices.get();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/invoices`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should make request to GET /invoices/id', async () => {
      await api.invoices.get('12345');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/invoices/12345`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('list', () => {
    it('should make request to GET /invoices', async () => {
      await api.invoices.list();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/invoices`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });
});
