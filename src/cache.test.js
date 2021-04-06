const api = require('./api');

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
});
