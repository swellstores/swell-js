const api = require('./api');

const mockSettingState = {
  store: {
    id: 'test',
    currency: 'AUD',
    currencies: [
      {
        code: 'AUD',
        rate: 1,
        name: 'Australian Dollar',
        symbol: '$',
        decimals: 2,
        type: 'base',
      },
      {
        code: 'USD',
        rate: 0.7707,
        name: 'US Dollar',
        symbol: '$',
        decimals: 2,
        type: 'display',
      },
      {
        code: 'EUR',
        rate: 1.8,
        name: 'Euro',
        symbol: '€',
        decimals: 2,
        type: 'priced',
      },
      {
        code: 'CNY',
        rate: 9.9,
        name: 'China',
        symbol: '?',
        decimals: 4,
        type: 'display',
        round: 'up',
        round_interval: 'fraction',
        round_fraction: 0.25,
      },
    ],
    locale: 'en-US',
  },
  session: {
    currency: undefined,
  },
};

describe('currency', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
    api.settings.state = JSON.parse(JSON.stringify(mockSettingState));
    api.currency.code = null;
    api.currency.state = null;
  });

  describe('methods', () => {
    it('should return methods list, select, selected, format', () => {
      expect(api.currency.list).toBeDefined();
      expect(api.currency.select).toBeDefined();
      expect(api.currency.selected).toBeDefined();
      expect(api.currency.format).toBeDefined();
    });
  });

  describe('list', () => {
    it('should return list of enabled currencies', () => {
      const currencies = api.currency.list();

      expect(currencies).toEqual(mockSettingState.store.currencies);
    });
  });

  describe('select', () => {
    it('should make request to PUT /session', async () => {
      await api.currency.select('USD');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/session`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
    });

    it('should set state to selected currency', async () => {
      await api.currency.select('USD');

      expect(api.currency.code).toEqual('USD');
      expect(api.currency.state).toEqual(mockSettingState.store.currencies[1]);
    });
  });

  describe('get', () => {
    it('should get store currency by default', async () => {
      const currency = api.currency.get();

      expect(currency).toEqual(mockSettingState.store.currencies[0]);
    });

    it('should get selected store currency', async () => {
      await api.currency.select('USD');
      const currency = api.currency.get();

      expect(currency).toEqual(mockSettingState.store.currencies[1]);
    });
  });

  describe('selected', () => {
    it('should get store currency code by default', async () => {
      const code = api.currency.selected();

      expect(code).toEqual('AUD');
    });

    it('should get selected store currency code', async () => {
      await api.currency.select('USD');
      const code = api.currency.selected();

      expect(code).toEqual('USD');
    });
  });

  describe('format', () => {
    it('should format base currency value', async () => {
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('A$1.00');
    });

    it('should format currency value by code', async () => {
      const formatted = api.currency.format(1, { code: 'USD' });

      expect(formatted).toEqual('$0.77');
    });

    it('should format currency value by locale', async () => {
      const formatted = api.currency.format(1, { locale: 'en-GB' });

      expect(formatted).toEqual('A$1.00');
    });

    it('should format currency value with decimals', async () => {
      const formatted = api.currency.format(1, { decimals: 4 });

      expect(formatted).toEqual('A$1.0000');
    });

    it('should convert amount by explicit rate', async () => {
      const formatted = api.currency.format(1, { rate: 0.5 });

      expect(formatted).toEqual('A$0.50');
    });

    it('should convert amount by selected display currency', async () => {
      await api.currency.select('USD');
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('$0.77');
    });

    it('should not convert amount by selected display currency when convert flag is false', async () => {
      await api.currency.select('USD');
      const formatted = api.currency.format(1, { convert: false });

      expect(formatted).toEqual('$1.00');
    });

    it('should convert amount by selected display currency with rounding (nearest whole)', async () => {
      const config = api.currency.list().find((curr) => curr.code === 'CNY');
      config.round = 'nearest';
      config.round_interval = 'fraction';
      config.round_fraction = 1;

      await api.currency.select('CNY');
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('CN¥11.0000');
    });

    it('should convert amount by selected display currency with rounding (up whole)', async () => {
      const config = api.currency.list().find((curr) => curr.code === 'CNY');
      config.round = 'up';
      config.round_interval = 'fraction';
      config.round_fraction = 1;

      await api.currency.select('CNY');
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('CN¥11.0000');
    });

    it('should convert amount by selected display currency with rounding (down whole)', async () => {
      const config = api.currency.list().find((curr) => curr.code === 'CNY');
      config.round = 'down';
      config.round_interval = 'fraction';
      config.round_fraction = 1;

      await api.currency.select('CNY');
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('CN¥10.0000');
    });

    it('should convert amount by selected display currency with rounding (nearest fraction)', async () => {
      const config = api.currency.list().find((curr) => curr.code === 'CNY');
      config.round = 'nearest';
      config.round_interval = 'fraction';
      config.round_fraction = 0.25;

      await api.currency.select('CNY');
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('CN¥10.2500');
    });

    it('should convert amount by selected display currency with rounding (up fraction)', async () => {
      const config = api.currency.list().find((curr) => curr.code === 'CNY');
      config.round = 'up';
      config.round_interval = 'fraction';
      config.round_fraction = 0.25;

      await api.currency.select('CNY');
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('CN¥10.2500');
    });

    it('should convert amount by selected display currency with rounding (down fraction)', async () => {
      const config = api.currency.list().find((curr) => curr.code === 'CNY');
      config.round = 'down';
      config.round_interval = 'fraction';
      config.round_fraction = 0.25;

      await api.currency.select('CNY');
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('CN¥9.2500');
    });

    it('should not convert amount by selected price currency', async () => {
      await api.currency.select('EUR');
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('€1.00');
    });

    it('should get currency symbol without value', async () => {
      const symbol = api.currency.format();

      expect(symbol).toEqual('A$');
    });

    it('should get selected currency symbol without value', async () => {
      await api.currency.select('EUR');
      const symbol = api.currency.format();

      expect(symbol).toEqual('€');
    });

    it('should default to USD format when state is empty', async () => {
      api.currency.code = null;
      api.currency.state = null;
      api.settings.state = {};
      api.settings.localizedState = {};
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('$1.00');
    });

    it('should default to USD format when params are empty', async () => {
      api.settings.state = {};
      api.settings.localizedState = {};
      const formatted = api.currency.format(1, {});

      expect(formatted).toEqual('$1.00');
    });

    it('should default to currency setting when currency list is empty', async () => {
      api.settings.state = { store: { currency: 'AUD', currencies: [] } };
      api.settings.localizedState = {};
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('A$1.00');
    });

    it('should use currency code state when currency list is empty', async () => {
      api.currency.code = 'EUR';
      api.settings.state = { store: { currencies: [] } };
      api.settings.localizedState = {};
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('€1.00');
    });

    it('should default to hyphenated locale', async () => {
      api.currency.code = 'EUR';
      api.settings.state = { store: { locale: 'en_US' } };
      api.settings.localizedState = {};
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('€1.00');
    });

    it('should default to en-US locale if setting is invalid', async () => {
      api.currency.code = 'EUR';
      api.settings.state = { store: { locale: 'INVALID' } };
      api.settings.localizedState = {};
      const formatted = api.currency.format(1);

      expect(formatted).toEqual('€1.00');
    });

    it('should default to en-US locale if setting is invalid calling format()', async () => {
      api.currency.code = 'EUR';
      api.settings.state = { store: {} };
      api.settings.localizedState = {};
      const formatted = api.currency.format(1, { locale: 'INVALID' });

      expect(formatted).toEqual('€1.00');
    });
  });
});
