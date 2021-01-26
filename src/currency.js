import { get, find } from './utils';
import { getCookie, setCookie } from './cookie';

function methods(request, opt) {
  return {
    code: null,
    state: null,
    locale: null,
    formatter: null,

    list() {
      return opt.api.settings.get('store.currencies', []);
    },

    async select(currency) {
      this.set(currency);
      setCookie('swell-currency', currency);
      return await request('put', '/session', { currency });
    },

    selected() {
      if (this.code) {
        return this.code;
      }
      const storeCurrency = opt.api.settings.get('store.currency');
      const cookieCurrency = getCookie('swell-currency');
      return cookieCurrency || storeCurrency;
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
      this.locale = opt.api.settings.get(
        'store.locale',
        typeof navigator === 'object' ? navigator.language : 'en-US',
      );
      this.state = find(this.list(), { code }) || {};
      try {
        this.formatter = new Intl.NumberFormat(this.locale, {
          style: 'currency',
          currency: code,
          currencyDisplay: 'symbol',
          minimumFractionDigits: this.state.decimals,
          maximumFractionDigits: this.state.decimals,
        });
      } catch (err) {
        console.error(err);
      }
      return this.state;
    },

    format(amount, params = {}) {
      let state = this.get();
      if (params.code && params.code !== state.code) {
        const list = this.list();
        state = find(list, { code: params.code }) || {};
      }

      const { code, rate, decimals, type } = state;
      const formatCode = params.code || code;
      const formatRate = params.rate || rate;
      const formatLocale = params.locale || this.locale;
      const formatDecimals = typeof params.decimals === 'number' ? params.decimals : decimals;

      let formatAmount = amount;
      if ((type === 'display' || params.rate) && typeof formatRate === 'number') {
        // Convert the price currency into the display currency
        formatAmount = amount * formatRate;
      }

      let formatter;
      try {
        formatter =
          formatCode === this.state.code &&
          formatLocale === this.locale &&
          formatDecimals === this.state.decimals
            ? this.formatter
            : new Intl.NumberFormat(formatLocale, {
                style: 'currency',
                currency: formatCode,
                currencyDisplay: 'symbol',
                minimumFractionDigits: formatDecimals,
                maximumFractionDigits: formatDecimals,
              });
        if (typeof formatAmount === 'number') {
          return formatter.format(formatAmount);
        } else {
          // Otherwise return the currency symbol only, falling back to '$'
          return get(formatter.formatToParts(0), '0.value', '$');
        }
      } catch (err) {
        console.error(err);
      }
      return String(amount);
    },
  };
}

export default methods;
