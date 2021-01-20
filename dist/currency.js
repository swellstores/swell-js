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

function methods(request, opt) {
  return {
    code: null,
    state: null,
    locale: null,
    formatter: null,
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
    set: function set(code) {
      this.code = code;
      this.locale = opt.api.settings.get('store.locale', (typeof navigator === "undefined" ? "undefined" : (0, _typeof2["default"])(navigator)) === 'object' ? navigator.language : 'en-US');
      this.state = find(this.list(), {
        code: code
      }) || {};

      try {
        this.formatter = new Intl.NumberFormat(this.locale, {
          style: 'currency',
          currency: code,
          currencyDisplay: 'symbol',
          minimumFractionDigits: this.state.decimals,
          maximumFractionDigits: this.state.decimals
        });
      } catch (err) {
        console.error(err);
      }

      return this.state;
    },
    format: function format(amount) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var state = this.get();

      if (params.code && params.code !== state.code) {
        var list = this.list();
        state = find(list, {
          code: params.code
        }) || {};
      }

      var _state = state,
          code = _state.code,
          rate = _state.rate,
          decimals = _state.decimals,
          type = _state.type;
      var formatCode = params.code || code;
      var formatRate = params.rate || rate;
      var formatLocale = params.locale || this.locale;
      var formatDecimals = typeof params.decimals === 'number' ? params.decimals : decimals;
      var formatAmount = amount;

      if ((type === 'display' || params.rate) && typeof formatRate === 'number') {
        // Convert the price currency into the display currency
        formatAmount = amount * formatRate;
      }

      var formatter;

      try {
        formatter = formatCode === code && formatLocale === this.locale && formatDecimals === decimals ? this.formatter : new Intl.NumberFormat(formatLocale, {
          style: 'currency',
          currency: formatCode,
          currencyDisplay: 'symbol',
          minimumFractionDigits: formatDecimals,
          maximumFractionDigits: formatDecimals
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
    }
  };
}

module.exports = {
  methods: methods
};