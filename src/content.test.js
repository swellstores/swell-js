import api from './api';

describe('content', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('list', () => {
    it('should make request to GET /content/pages', async () => {
      await api.content.list('pages');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/content/pages`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should make request to GET /content/pages?query', async () => {
      await api.content.list('pages', { query: 1 });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/content/pages?query=1`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('get', () => {
    it('should make request to GET /content/pages/slug', async () => {
      await api.content.get('pages', 'slug');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/content/pages/slug?$preview=false`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should make request to GET /content/pages/slug?query', async () => {
      await api.content.get('pages', 'slug', { query: 1 });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/content/pages/slug?$preview=false&query=1`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });
});
