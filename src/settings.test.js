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

    it('should decode $locale objects', async () => {
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

      api.locale.select('en');
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

    it('should decode $locale objects from raw state', async () => {
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

      api.locale.select('en');
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

    it('should decode $locale objects from multiple states', async () => {
      api.settings.locale = 'en';
      api.settings.localizedState = {};
      api.settings.state = {
        store: { locale: 'en' },
        test: 'hello',
        $locale: { en: { test: 'hellooo' }, es: { test: 'hola' } },
      };
      api.settings.menuState = [
        {
          id: 'header',
          test: 'hello1',
          $locale: { en: { test: 'hellooo1' }, es: { test: 'hola1' } },
        },
        {
          id: 'footer',
          test: 'hello2',
          $locale: { en: { test: 'hellooo2' }, es: { test: 'hola2' } },
        },
      ];

      api.locale.select('en');
      let test = await api.settings.get('test');
      expect(test).toEqual('hellooo');
      let menu = await api.settings.menus('header');
      expect(menu.test).toEqual('hellooo1');

      api.locale.select('es');
      test = await api.settings.get('test');
      expect(test).toEqual('hola');
      menu = await api.settings.menus('footer');
      expect(menu.test).toEqual('hola2');
    });

    it('should update localized state when calling set()', async () => {
      api.settings.locale = 'en';
      api.settings.localizedState = {};
      api.settings.state = {
        store: {
          locale: 'en',
          name: 'test store',
          $locale: {},
        },
      };

      api.locale.select('en');
      let test = await api.settings.get('store.name');
      expect(test).toEqual('test store');

      api.settings.set({ path: 'store.name', value: 'test store 2' });

      test = await api.settings.get('store.name');
      expect(test).toEqual('test store 2');
    });

    it('should update localized $locale state when calling set()', async () => {
      api.settings.locale = 'en';
      api.settings.localizedState = {};
      api.settings.state = {
        store: {
          locale: 'en',
          name: 'test store',
          $locale: {
            en: {
              name: 'test store',
            },
          },
        },
      };

      let test = await api.settings.get('store.name');
      expect(test).toEqual('test store');

      api.settings.set({ path: 'store.$locale.en.name', value: 'test store 2' });

      test = await api.settings.get('store.name');
      expect(test).toEqual('test store 2');
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
