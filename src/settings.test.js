const api = require('./api');

describe('settings', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('get', () => {
    it('should make request to GET /settings', async () => {
      await api.settings.get();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/settings`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should register response state', async () => {
      api.settings.state = null;
      fetch.mockResponseOnce(JSON.stringify({ store_title: 'Test' }));
      await api.settings.get();
      expect(api.settings.state).toEqual({ store_title: 'Test' });
    });

    it('should delocale $locale objects', async () => {
      api.settings.state = null;
      fetch.mockResponseOnce(
        JSON.stringify({
          store: { locale: 'en' },
          test: 'hello',
          $locale: { en: { test: 'hellooo' }, es: { test: 'hola' } },
          obj: {
            value: '1',
            $locale: { en: { value: '2' }, es: { value: '3' } },
          },
        }),
      );

      let test = await api.settings.get('test');
      expect(test).toEqual('hellooo');

      api.locale.select('es');
      test = await api.settings.get('test');
      expect(test).toEqual('hola');

      api.locale.select('en');
      test = await api.settings.get('obj.value');
      expect(test).toEqual('2');

      api.locale.select('es');
      test = await api.settings.get('obj.value');
      expect(test).toEqual('3');
    });

    it('should delocale $locale objects from raw state', async () => {
      api.settings.locale = 'en';
      api.settings.localizedState = {};
      api.settings.state = {
        store: { locale: 'en' },
        test: 'hello',
        $locale: { en: { test: 'hellooo' }, es: { test: 'hola' } },
        obj: {
          value: '1',
          $locale: { en: { value: '2' }, es: { value: '3' } },
        },
      };

      let test = await api.settings.get('test');
      expect(test).toEqual('hellooo');

      api.locale.select('es');
      test = await api.settings.get('test');
      expect(test).toEqual('hola');

      api.locale.select('en');
      test = await api.settings.get('obj.value');
      expect(test).toEqual('2');

      api.locale.select('es');
      test = await api.settings.get('obj.value');
      expect(test).toEqual('3');
    });
  });

  describe('payments', () => {
    it('should make request to GET /settings/payments', async () => {
      await api.settings.payments();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/settings/payments`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should register response payment state', async () => {
      api.settings.paymentState = null;
      fetch.mockResponseOnce(JSON.stringify({ card: {} }));
      await api.settings.payments();
      expect(api.settings.paymentState).toEqual({ card: {} });
    });
  });
});
