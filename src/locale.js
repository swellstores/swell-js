const { find } = require('./utils');
const { getCookie, setCookie } = require('./cookie');

function methods(request, opt) {
  return {
    code: null,
    state: null,

    list() {
      return opt.api.settings.get('store.locales', []);
    },

    async select(locale) {
      this.set(locale);
      setCookie('swell-locale', locale);
      opt.api.settings.locale = locale;
      return await request('put', '/session', { locale });
    },

    selected() {
      if (this.code) {
        return this.code;
      }
      const storeLocale = opt.api.settings.getStoreLocale();
      const cookieLocale = getCookie('swell-locale');
      opt.api.settings.locale = cookieLocale || storeLocale;
      return cookieLocale || storeLocale;
    },

    get() {
      if (!this.code) {
        this.code = this.selected();
      }
      if (!this.state) {
        this.state = this.set(this.code);
      }
      return this.state;
    },

    set(code) {
      this.code = code;
      this.state = find(this.list(), { code }) || {};
      return this.state;
    },
  };
}

module.exports = {
  methods,
};
