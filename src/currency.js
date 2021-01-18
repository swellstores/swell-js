const { get, find } = require('./utils');

function methods(request, opt) {
  return {
    code: null,
    state: null,
    locale: null,
    formatter: null,

    list() {
      return opt.api.settings.get('store.currencies');
    },

    async select(currency) {
      this.set(currency);
      opt.api.settings.set({ path: 'session.currency', value: currency });
      return await request('put', '/session', { currency });
    },

    selected() {
      const storeCurrency = opt.api.settings.get('store.currency');
      const sessionCurrency = opt.api.settings.get('session.currency');
      return sessionCurrency || storeCurrency;
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
      this.formatter = new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: this.state.decimals,
        maximumFractionDigits: this.state.decimals,
      });
      return this.state;
    },

    format(amount, params = {}) {
      const { code, rate, decimals, type } = this.get();

      const formatCode = params.code || code;
      const formatRate = params.rate || rate;
      const formatLocale = params.locale || this.locale;
      const formatDecimals = params.decimals || decimals;

      let formatAmount = amount;
      if ((type === 'display' || params.rate) && typeof formatRate === 'number') {
        // Convert the price currency into the display currency
        formatAmount = amount * formatRate;
      }

      let formatter;
      try {
        formatter =
          formatCode === code && formatLocale === this.locale && formatDecimals === decimals
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
      return '';
    },
  };
}

module.exports = {
  methods,
};
