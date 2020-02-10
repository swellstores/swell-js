"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lodash = require("lodash");

function methods(request) {
  return {
    state: null,
    refresh: function () {
      var _refresh = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
        var result;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return request('get', '/settings');

              case 2:
                result = _context.sent;
                return _context.abrupt("return", this.state = result);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function refresh() {
        return _refresh.apply(this, arguments);
      }

      return refresh;
    }(),
    get: function get() {
      if (this.state) {
        return this.state;
      }

      return this.refresh();
    },
    getMenu: function () {
      var _getMenu = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(id) {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = _lodash.find;
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
    }()
  };
}

module.exports = {
  methods: methods
};