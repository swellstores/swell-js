"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./utils'),
    get = _require.get,
    find = _require.find;

var _require2 = require('./cookie'),
    getCookie = _require2.getCookie,
    setCookie = _require2.setCookie;

var FORMATTERS = {};

function methods(request, opt) {
  return {
    code: null,
    state: null,
    locale: null,
    list: function list() {
      return opt.api.settings.get('store.currencies', []);
    },
    select: function () {
      var _select = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(currency) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.set(currency);
                setCookie('swell-currency', currency);
                _context.next = 4;
                return request('put', '/session', {
                  currency: currency
                });

              case 4:
                return _context.abrupt("return", _context.sent);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function select(_x) {
        return _select.apply(this, arguments);
      }

      return select;
    }(),
    selected: function selected() {
      if (this.code) {
        return this.code;
      }

      var storeCurrency = opt.api.settings.get('store.currency');
      var cookieCurrency = getCookie('swell-currency');
      return cookieCurrency || storeCurrency;
    },
    get: function get() {
      if (!this.code) {
        this.code = this.selected();
      }

      if (!this.state) {
        this.state = this.set(this.code);
      }

      return this.state;
    },
    set: function set() {
      var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'USD';
      this.code = code;
      this.state = find(this.list(), {
        code: code
      }) || {
        code: code
      };
      this.locale = String(opt.api.settings.get('store.locale', (typeof navigator === "undefined" ? "undefined" : (0, _typeof2["default"])(navigator)) === 'object' ? navigator.language : 'en-US'));
      return this.state;
    },
    format: function format(amount) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var state = this.get();

      if (params.code && params.code !== state.code) {
        var list = this.list();
        state = find(list, {
          code: params.code
        }) || {
          code: params.code
        };
      }

      var _state = state,
          _state$code = _state.code,
          code = _state$code === void 0 ? 'USD' : _state$code,
          type = _state.type,
          decimals = _state.decimals,
          rate = _state.rate;
      var formatCode = params.code || code;
      var formatRate = params.rate || rate;
      var formatLocale = params.locale || this.locale;
      var formatDecimals = typeof params.decimals === 'number' ? params.decimals : decimals;
      var _params$convert = params.convert,
          convert = _params$convert === void 0 ? true : _params$convert;
      var formatAmount = amount;

      if (convert && (type === 'display' || params.rate) && typeof formatAmount === 'number' && typeof formatRate === 'number') {
        // Convert the price currency into the display currency
        formatAmount = this.applyRounding(amount * formatRate, state);
      }

      var formatter = this.formatter({
        code: formatCode,
        locale: formatLocale,
        decimals: formatDecimals
      });

      try {
        if (typeof formatAmount === 'number') {
          return formatter.format(formatAmount);
        } else {
          // Otherwise return the currency symbol only, falling back to '$'
          var symbol = get(formatter.formatToParts(0), '0.value', '$');
          return symbol !== formatCode ? symbol : '';
        }
      } catch (err) {
        console.warn(err);
      }

      return String(amount);
    },
    formatter: function formatter(_ref) {
      var code = _ref.code,
          locale = _ref.locale,
          decimals = _ref.decimals;
      var key = [code, locale, decimals].join('|');

      if (FORMATTERS[key]) {
        return FORMATTERS[key];
      }

      var formatLocale = String(locale || '').replace('_', '-') || 'en-US';
      var formatDecimals = typeof decimals === 'number' ? decimals : undefined;
      var props = {
        style: 'currency',
        currency: code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: formatDecimals,
        maximumFractionDigits: formatDecimals
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
    applyRounding: function applyRounding(value, config) {
      if (!config || !config.round) {
        return value;
      }

      var scale = config.decimals;
      var fraction = config.round_interval === 'fraction' ? config.round_fraction || 0 : 0;
      var roundValue = ~~value;
      var decimalValue = this.round(value, scale);

      if (decimalValue === fraction) {
        return roundValue + decimalValue;
      }

      var diff = this.round(decimalValue - fraction, 1);
      var direction = config.round === 'nearest' ? diff > 0 ? diff >= 0.5 ? 'up' : 'down' : diff <= -0.5 ? 'down' : 'up' : config.round;

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
    round: function round(value) {
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // TODO: this is unrealiable (but only used for display)
      return Number(Number(value).toFixed(scale));
    }
  };
}

module.exports = {
  methods: methods
};