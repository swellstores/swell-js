"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./utils'),
    get = _require.get,
    find = _require.find;

function methods(request) {
  return {
    state: null,
    menuState: null,
    paymentState: null,
    refresh: function refresh() {
      this.state = null;
      this.menuState = null;
      this.paymentState = null;
      return this.get();
    },
    getState: function () {
      var _getState = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(uri, stateName) {
        var _this = this;

        var id,
            def,
            _args = arguments;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                id = _args.length > 2 && _args[2] !== undefined ? _args[2] : undefined;
                def = _args.length > 3 && _args[3] !== undefined ? _args[3] : undefined;

                if (!this[stateName]) {
                  this[stateName] = request('get', uri);
                }

                if (!(typeof this[stateName].then === 'function')) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", this[stateName].then(function (state) {
                  _this[stateName] = state;
                  return id ? get(state, id, def) : state;
                }));

              case 5:
                return _context.abrupt("return", id ? get(this[stateName], id, def) : this[stateName]);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getState(_x, _x2) {
        return _getState.apply(this, arguments);
      }

      return getState;
    }(),
    findState: function findState(uri, stateName) {
      var where = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var def = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
      return this.getState(uri, stateName).then(function (state) {
        return find(state, where) || def;
      });
    },
    get: function get() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.getState('/settings', 'state', id, def);
    },
    menus: function menus() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.findState('/settings/menus', 'menuState', {
        id: id
      }, def);
    },
    payments: function payments() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.getState('/settings/payments', 'paymentState', id, def);
    }
  };
}

module.exports = {
  methods: methods
};