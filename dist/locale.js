"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./utils'),
    find = _require.find;

var _require2 = require('./cookie'),
    getCookie = _require2.getCookie,
    setCookie = _require2.setCookie;

function methods(request, opt) {
  return {
    code: null,
    state: null,
    list: function list() {
      return opt.api.settings.get('store.locales', []);
    },
    select: function () {
      var _select = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(locale) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.set(locale);
                setCookie('swell-locale', locale);
                opt.api.settings.locale = locale;
                _context.next = 5;
                return request('put', '/session', {
                  locale: locale
                });

              case 5:
                return _context.abrupt("return", _context.sent);

              case 6:
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

      var storeLocale = opt.api.settings.getStoreLocale();
      var cookieLocale = getCookie('swell-locale');
      opt.api.settings.locale = cookieLocale || storeLocale;
      return cookieLocale || storeLocale;
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
      this.state = find(this.list(), {
        code: code
      }) || {};
      return this.state;
    }
  };
}

module.exports = {
  methods: methods
};