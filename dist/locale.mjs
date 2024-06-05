import 'qs';
import { f as find } from './find.18f1ac6d.mjs';
import 'deepmerge';
import 'fast-case';

function methods(request, opt) {
  return {
    code: null,
    state: null,

    list() {
      return opt.api.settings.get('store.locales', []);
    },

    async select(locale) {
      this.set(locale);
      opt.setCookie('swell-locale', locale);
      opt.api.settings.locale = locale;
      return await request('put', '/session', { locale });
    },

    selected() {
      if (this.code) {
        return this.code;
      }
      const storeLocale = opt.api.settings.getStoreLocale();
      const cookieLocale = opt.getCookie('swell-locale');
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

export { methods as default };
