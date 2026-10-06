import { get, find, round } from './utils';

const FORMATTERS = {};

// A currency code is three letters. Anything else, such as a pending settings
// Promise that was stringified to "[object Promise]", is not a currency.
export function isCurrencyCode(value) {
  return typeof value === 'string' && /^[a-z]{3}$/i.test(value);
}

function defaultLocale() {
  return typeof navigator === 'object' ? navigator.language : 'en-US';
}

function methods(api, opt) {
  // Reads a store setting without ever returning a Promise. Until settings
  // load, this starts the request and reports `loaded: false`.
  function readSetting(path, def) {
    const value = opt.api.settings.get(path, def);

    if (value && typeof value.then === 'function') {
      value.catch(() => {}); // callers that await settings report the error
      return { loaded: false, value: def };
    }

    return { loaded: true, value };
  }

  return {
    code: null,
    state: null,
    locale: null,

    list() {
      return opt.api.settings.get('store.currencies', []);
    },

    async select(currency) {
      this.set(currency);

      return api.request('put', '/session', { currency });
    },

    selected() {
      if (!this.code) {
        const cookieCode = opt.getCookie('swell-currency');

        if (isCurrencyCode(cookieCode)) {
          this.set(cookieCode);
        } else {
          const storeCode = readSetting('store.currency');

          if (!storeCode.loaded) {
            // Settings are still loading: use a stand-in without saving it,
            // so the store currency is picked up once they arrive.
            return 'USD';
          }

          this.set(isCurrencyCode(storeCode.value) ? storeCode.value : 'USD');
        }
      }

      return this.code;
    },

    get() {
      const code = this.selected();

      if (this.state) {
        return this.state;
      }

      if (!readSetting('store.currencies').loaded) {
        // Not cached, so the currency's rate and decimals apply once
        // settings load.
        return { code };
      }

      return this.set(code);
    },

    set(code = 'USD') {
      if (!isCurrencyCode(code)) {
        // Never store or persist something that isn't a currency code.
        return this.state || { code: this.code || 'USD' };
      }

      const list = readSetting('store.currencies', []);
      const state = (list.loaded && find(list.value, { code })) || { code };

      this.code = code;
      // Only cache a state built from the loaded currency list.
      this.state = list.loaded ? state : null;
      this.locale = String(readSetting('store.locale', defaultLocale()).value);

      opt.setCookie('swell-currency', code);

      return state;
    },

    format(amount, params = {}) {
      let state = this.get();
      if (params.code && params.code !== state.code) {
        const list = readSetting('store.currencies', []).value;
        state = find(list, { code: params.code }) || { code: params.code };
      }

      const { code = 'USD', type, decimals, rate } = state;
      const formatCode = params.code || code;
      const formatRate = params.rate || rate;
      const formatLocale = params.locale || this.locale || defaultLocale();
      const formatDecimals = 'decimals' in params ? params.decimals : decimals;
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
      locale = String(locale || '').replace('_', '-');

      const key = [code, locale, decimals].join('|');

      if (FORMATTERS[key]) {
        return FORMATTERS[key];
      }

      const formatLocales = [];

      if (locale) {
        formatLocales.push(locale);
      }

      formatLocales.push('en-US');

      const formatDecimals =
        typeof decimals === 'number' ? decimals : undefined;

      const props = {
        style: 'currency',
        currency: code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: formatDecimals,
        maximumFractionDigits: formatDecimals,
      };

      try {
        try {
          FORMATTERS[key] = new Intl.NumberFormat(formatLocales, props);
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
      const fraction =
        config.round_interval === 'fraction' ? config.round_fraction || 0 : 0;

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
          roundValue =
            roundValue + fraction - (decimalValue > fraction ? 0 : 1);
          break;
        case 'up':
        default:
          roundValue =
            roundValue + fraction + (decimalValue > fraction ? 1 : 0);
          break;
      }

      return this.round(roundValue, scale);
    },

    round,
  };
}

export default methods;
