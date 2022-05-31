import api from './api';

const mockSettingState = {
  store: {
    id: 'test',
    locale: 'en-US',
    locales: [
      {
        code: 'en-US',
        name: 'English (United States)',
      },
      {
        code: 'fr-CA',
        name: 'French (Canada)',
      },
      {
        code: 'de',
        name: 'German',
      },
    ],
  },
  session: {
    locale: undefined,
  },
};

describe('locale', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
    api.settings.state = JSON.parse(JSON.stringify(mockSettingState));
    api.locale.code = null;
    api.locale.state = null;
  });

  describe('methods', () => {
    it('should return methods list, select, selected', () => {
      expect(api.locale.list).toBeDefined();
      expect(api.locale.select).toBeDefined();
      expect(api.locale.selected).toBeDefined();
    });
  });

  describe('list', () => {
    it('should return list of enabled locales', () => {
      const locales = api.locale.list();

      expect(locales).toEqual(mockSettingState.store.locales);
    });
  });

  describe('select', () => {
    it('should make request to PUT /session', async () => {
      await api.locale.select('de-DE');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/session`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
    });

    it('should set state to selected locale', async () => {
      await api.locale.select('fr-CA');

      expect(api.locale.code).toEqual('fr-CA');
      expect(api.locale.state).toEqual(mockSettingState.store.locales[1]);
    });
  });

  describe('get', () => {
    it('should get store locale by default', async () => {
      const locale = api.locale.get();

      expect(locale).toEqual(mockSettingState.store.locales[0]);
    });

    it('should get selected store locale', async () => {
      await api.locale.select('fr-CA');
      const locale = api.locale.get();

      expect(locale).toEqual(mockSettingState.store.locales[1]);
    });
  });

  describe('selected', () => {
    it('should get store locale code by default', async () => {
      const code = api.locale.selected();

      expect(code).toEqual('en-US');
    });

    it('should get selected store locale code', async () => {
      await api.locale.select('fr-CA');
      const code = api.locale.selected();

      expect(code).toEqual('fr-CA');
    });
  });
});
