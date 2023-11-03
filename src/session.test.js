import api from './api';

describe('session', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('get', () => {
    it('should make request to GET /api/session', async () => {
      await api.session.get();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/session`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('getCookie', () => {
    it('should return the session cookie', async () => {
      global.document = { cookie: 'swell-session=test' };
      global.window = { document: global.document };

      expect(api.session.getCookie()).toEqual('test');
    });
  });

  describe('setCookie', () => {
    it('should set the session cookie', async () => {
      global.document = { cookie: '' };
      global.window = { document: global.document };
      api.session.setCookie('test');

      expect(global.document.cookie.includes('swell-session=test;')).toEqual(
        true,
      );
    });
  });
});
