const { get, find } = require('./utils');
const { getCookie, setCookie } = require('./cookie');

const FORMATTERS = {};

function methods(request, opt) {
  return {
    code: null,
    state: null,
    locale: null,

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

    set(code = 'USD') {
      this.code = code;
      this.state = find(this.list(), { code }) || { code };
      this.locale = String(
        opt.api.settings.get(
          'store.locale',
          typeof navigator === 'object' ? navigator.language : 'en-US',
        ),
      );
      return this.state;
    },

    format(amount, params = {}) {
      let state = this.get();
      if (params.code && params.code !== state.code) {
        const list = this.list();
        state = find(list, { code: params.code }) || { code: params.code };
      }

      const { code = 'USD', type, decimals, rate } = state;
      const formatCode = params.code || code;
      const formatRate = params.rate || rate;
      const formatLocale = params.locale || this.locale;
      const formatDecimals = typeof params.decimals === 'number' ? params.decimals : decimals;
      const { convert = true } = params;

      let formatAmount = amount;
      if (
        convert &&
        (type === 'display' || params.rate) &&
        typeof formatAmount === 'number' &&
        typeof formatRate === 'number'
      ) {
        // Convert the price currency into the display currency
        formatAmount = this.applyRounding(amount * formatRate, state);
      }

      const formatter = this.formatter({
        code: formatCode,
        locale: formatLocale,
        decimals: formatDecimals,
      });
      try {
        if (typeof formatAmount === 'number') {
          return formatter.format(formatAmount);
        } else {
          // Otherwise return the currency symbol only, falling back to '$'
          const symbol = get(formatter.formatToParts(0), '0.value', '$');
          return symbol !== formatCode ? symbol : '';
        }
      } catch (err) {
        console.warn(err);
      }

      return String(amount);
    },

    formatter({ code, locale, decimals }) {
      const key = [code, locale, decimals].join('|');
      if (FORMATTERS[key]) {
        return FORMATTERS[key];
      }

      const formatLocale = String(locale || '').replace('_', '-') || 'en-US';
      const formatDecimals = typeof decimals === 'number' ? decimals : undefined;
      const props = {
        style: 'currency',
        currency: code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: formatDecimals,
        maximumFractionDigits: formatDecimals,
      };

      try {
        try {
          FORMATTERS[key] = new Intl.NumberFormat(formatLocale, props);
        } catch (err) {
          if (err.message.indexOf('Invalid language tag') >= 0) {
            FORMATTERS[key] = new Intl.NumberFormat('en-US', props);
          }
        }
      } catch (err) {
        console.warn(err);
      }

      return FORMATTERS[key];
    },

    applyRounding(value, config) {
      if (!config || !config.round) {
        return value;
      }

      const scale = config.decimals;
      const fraction = config.round_interval === 'fraction' ? config.round_fraction || 0 : 0;

      let roundValue = ~~value;
      let decimalValue = this.round(value, scale);

      if (decimalValue === fraction) {
        return roundValue + decimalValue;
      }

      const diff = this.round(decimalValue - fraction, 1);
      const direction =
        config.round === 'nearest'
          ? diff > 0
            ? diff >= 0.5
              ? 'up'
              : 'down'
            : diff <= -0.5
            ? 'down'
            : 'up'
          : config.round;

      switch (direction) {
        case 'down':
          roundValue = roundValue + fraction - (decimalValue > fraction ? 0 : 1);
          break;
        case 'up':
        default:
          roundValue = roundValue + fraction + (decimalValue > fraction ? 1 : 0);
          break;
      }

      return this.round(roundValue, scale);
    },

    round(value, scale = 0) {
      // TODO: this is unrealiable (but only used for display)
      return Number(Number(value).toFixed(scale));
    },
  };
}

module.exports = {
  methods,
};
