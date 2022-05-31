import api from './api';

describe('cache', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('setRecord', () => {
    it('should not cause an infinite loop', async () => {
      api.cache.set({ model: 'pages', id: '1', value: {} });
      api.cache.setRecord(undefined, { model: 'pages', id: '1' });

      const record = api.cache.get('pages', '1');

      expect(record).toEqual({});
    });
  });

  describe('getFetch', () => {
    it('should request from API just once, when cache is enabled', async () => {
      api.cache.options.enabled = true;
      await api.content.get('pages', 'slug');

      api.cache.set({ model: 'content_pages', id: 'slug', value: {} });

      await api.content.get('pages', 'slug');

      expect(fetch.mock.calls.length).toEqual(1);
    });

    it('should request from API everytime, when cache is not enabled', async () => {
      api.cache.options.enabled = false;
      await api.content.get('pages', 'slug');

      api.cache.set({ model: 'content_pages', id: 'slug', value: {} });

      await api.content.get('pages', 'slug');

      expect(fetch.mock.calls.length).toEqual(2);
    });
  });
});
