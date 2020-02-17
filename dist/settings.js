"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('lodash'),
    find = _require.find;

function methods(request) {
  return {
    state: null,
    paymentState: null,
    get: function () {
      var _get = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var result;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.state) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", this.state);

              case 2:
                _context.next = 4;
                return request('get', '/settings');

              case 4:
                result = _context.sent;
                return _context.abrupt("return", this.state = result);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function get() {
        return _get.apply(this, arguments);
      }

      return get;
    }(),
    refresh: function refresh() {
      this.state = null;
      this.paymentState = null;
      return this.get();
    },
    getMenu: function () {
      var _getMenu = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(id) {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = find;
                _context2.next = 3;
                return this.get();

              case 3:
                _context2.t1 = _context2.sent;
                _context2.t2 = id;
                return _context2.abrupt("return", (0, _context2.t0)(_context2.t1, _context2.t2));

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getMenu(_x) {
        return _getMenu.apply(this, arguments);
      }

      return getMenu;
    }(),
    payments: function () {
      var _payments = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        var result;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!this.paymentState) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return", this.paymentState);

              case 2:
                _context3.next = 4;
                return request('get', '/settings/payments');

              case 4:
                result = _context3.sent;
                return _context3.abrupt("return", this.paymentState = result);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function payments() {
        return _payments.apply(this, arguments);
      }

      return payments;
    }()
  };
}

module.exports = {
  methods: methods
};