"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./utils'),
    get = _require.get,
    find = _require.find,
    _set = _require.set,
    merge = _require.merge,
    toCamel = _require.toCamel;

function methods(request, opt) {
  return {
    state: null,
    menuState: null,
    paymentState: null,
    sessionState: null,
    refresh: function refresh() {
      this.state = null;
      this.menuState = null;
      this.paymentState = null;
      this.sessionState = null;
      return this.get();
    },
    getState: function getState(uri, stateName) {
      var _this = this;

      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref$id = _ref.id,
          id = _ref$id === void 0 ? undefined : _ref$id,
          _ref$def = _ref.def,
          def = _ref$def === void 0 ? undefined : _ref$def,
          _ref$refresh = _ref.refresh,
          refresh = _ref$refresh === void 0 ? false : _ref$refresh;

      if (!this[stateName] || refresh) {
        this[stateName] = request('get', uri);
      }

      if (this[stateName] && typeof this[stateName].then === 'function') {
        return this[stateName].then(function (state) {
          _this[stateName] = state;
          return id ? get(state, id, def) : state;
        });
      }

      return id ? get(this[stateName], id, def) : this[stateName];
    },
    findState: function findState(uri, stateName) {
      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref2$where = _ref2.where,
          where = _ref2$where === void 0 ? undefined : _ref2$where,
          _ref2$def = _ref2.def,
          def = _ref2$def === void 0 ? undefined : _ref2$def;

      var state = this.getState(uri, stateName);

      if (state && typeof state.then === 'function') {
        return state.then(function (state) {
          return find(state, where) || def;
        });
      }

      return find(state, where) || def;
    },
    get: function get() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.getState('/settings', 'state', {
        id: id,
        def: def
      });
    },
    set: function set(_ref3) {
      var model = _ref3.model,
          path = _ref3.path,
          value = _ref3.value;
      var stateName = model ? "".concat(model.replace(/s$/, ''), "State") : 'state';
      var useCamelCase = opt.useCamelCase;
      var mergeData = {};

      if (model === 'menus') {
        if (path !== undefined) {
          _set(mergeData, path || '', value);
        } else {
          mergeData = value;
        }
      } else {
        _set(mergeData, path || '', value);
      }

      if (useCamelCase) {
        mergeData = toCamel(mergeData);
      }

      this[stateName] = merge(this[stateName], mergeData);
    },
    menus: function menus() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.findState('/settings/menus', 'menuState', {
        where: {
          id: id
        },
        def: def
      });
    },
    payments: function payments() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.getState('/settings/payments', 'paymentState', {
        id: id,
        def: def
      });
    },
    session: function session() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.getState('/session', 'sessionState', {
        id: id,
        def: def
      });
    },
    load: function () {
      var _load = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _yield$request, settings, menus, payments, session;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return request('get', '/settings/all');

              case 3:
                _yield$request = _context.sent;
                settings = _yield$request.settings;
                menus = _yield$request.menus;
                payments = _yield$request.payments;
                session = _yield$request.session;
                this.state = settings;
                this.menuState = menus;
                this.paymentState = payments;
                this.sessionState = session;
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](0);
                console.error("Swell: unable to loading settings (".concat(_context.t0, ")"));

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 14]]);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  };
}

module.exports = {
  methods: methods
};