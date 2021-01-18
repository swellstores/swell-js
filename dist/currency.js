"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./utils'),
    get = _require.get,
    find = _require.find;

function methods(request, options, api) {
  return {
    code: null,
    state: null,
    locale: null,
    formatter: null,
    list: function list() {
      return api.setitngs.get('store.currencies');
    },
    select: function () {
      var _select = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(currency) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.setState(currency);
                _context.next = 3;
                return request('put', '/session', {
                  currency: currency
                });

              case 3:
                return _context.abrupt("return", _context.sent);

              case 4:
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
      var storeCurrency = api.setitngs.get('store.currency');
      var sessionCurrency = api.setitngs.get('session.currency');
      return sessionCurrency || storeCurrency;
    },
    getState: function getState() {
      if (!this.code) {
        this.code = this.selected();
      }

      if (!this.state) {
        this.state = this.setState(this.code);
      }

      return this.state;
    },
    setState: function setState(code) {
      this.code = code;
      this.locale = api.settings.get('store.locale', navigator.language);
      this.formatter = new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: code
      });
      this.state = find(this.list(), {
        code: code
      });
      return this.state;
    },
    format: function format(amount) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _this$getState = this.getState(),
          _this$getState$code = _this$getState.code,
          formatCode = _this$getState$code === void 0 ? params.code : _this$getState$code,
          _this$getState$rate = _this$getState.rate,
          formatRate = _this$getState$rate === void 0 ? params.rate : _this$getState$rate,
          type = _this$getState.type;

      var formatAmount = amount;

      if (type === 'display' && typeof formatRate === 'number') {
        // Convert the price currency into the display currency
        formatAmount = amount * formatRate;
      }

      var formatter;

      try {
        formatter = formatCode === this.code ? this.formatter : new Intl.NumberFormat(this.locale, {
          style: 'currency',
          currency: formatCode
        });

        if (typeof formatAmount === 'number') {
          return this.formatter.format(formatAmount);
        } else {
          // Otherwise return the currency symbol only, falling back to '$'
          return get(this.formatter.formatToParts(0), '0.value', '$');
        }
      } catch (err) {
        console.error(err);
      }

      return '';
    }
  };
}

module.exports = {
  methods: methods
};