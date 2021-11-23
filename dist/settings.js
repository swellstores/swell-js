"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('./utils'),
    get = _require.get,
    find = _require.find,
    _set = _require.set,
    merge = _require.merge,
    toCamel = _require.toCamel,
    isObject = _require.isObject,
    cloneDeep = _require.cloneDeep,
    camelCase = _require.camelCase;

function methods(request, opt) {
  return {
    state: null,
    menuState: null,
    paymentState: null,
    subscriptionState: null,
    sessionState: null,
    localizedState: {},
    refresh: function refresh() {
      this.state = null;
      this.menuState = null;
      this.paymentState = null;
      this.subscriptionState = null;
      this.sessionState = null;
      this.localizedState = {};
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
          return _this.getLocalizedState(stateName, id, def);
        });
      }

      return this.getLocalizedState(stateName, id, def);
    },
    getLocalizedState: function getLocalizedState(stateName, id, def) {
      var locale = this.getCurrentLocale();
      var ls = this.localizedState;

      if (ls.code !== locale) {
        ls.code = locale;
        delete ls[locale];
      }

      if (!ls[locale]) {
        ls[locale] = {};
      }

      if (!ls[locale][stateName]) {
        ls[locale][stateName] = this.decodeLocale(this[stateName]);
      }

      return id ? get(ls[locale][stateName], id, def) : ls[locale][stateName];
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
    getCurrentLocale: function getCurrentLocale() {
      return opt.api.locale.selected();
    },
    getStoreLocale: function getStoreLocale() {
      return get(this.state, 'store.locale');
    },
    getStoreLocales: function getStoreLocales() {
      return get(this.state, 'store.locales');
    },
    set: function set(_ref3) {
      var model = _ref3.model,
          path = _ref3.path,
          value = _ref3.value;
      var locale = this.getCurrentLocale();
      var stateName = model ? "".concat(model.replace(/s$/, ''), "State") : 'state';
      var useCamelCase = opt.useCamelCase;
      var mergeData = {};
      if (path) _set(mergeData, path, value);else mergeData = value;

      if (useCamelCase) {
        mergeData = toCamel(mergeData);
      }

      this[stateName] = merge(this[stateName] || {}, mergeData);

      if (this.localizedState[locale]) {
        this.localizedState[locale][stateName] = this.decodeLocale(this[stateName]);
      }
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
    subscriptions: function subscriptions() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.getState('/settings/subscriptions', 'subscriptionState', {
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
    decodeLocale: function decodeLocale(values) {
      var locale = this.getCurrentLocale();

      if (!values || (0, _typeof2["default"])(values) !== 'object') {
        return values;
      }

      var configs = this.getStoreLocales();

      if (configs) {
        configs = configs.reduce(function (acc, config) {
          return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, config.code, config));
        }, {});
      } else {
        configs = {};
      }

      return decodeLocaleObjects(cloneDeep(values), locale, configs, opt);
    },
    load: function () {
      var _load = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _yield$request, settings, menus, payments, subscriptions, session;

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
                subscriptions = _yield$request.subscriptions;
                session = _yield$request.session;
                this.localizedState = {};
                this.set({
                  value: settings
                });
                this.set({
                  model: 'menus',
                  value: menus
                });
                this.set({
                  model: 'payments',
                  value: payments
                });
                this.set({
                  model: 'subscriptions',
                  value: subscriptions
                });
                this.set({
                  model: 'session',
                  value: session
                });
                _context.next = 20;
                break;

              case 17:
                _context.prev = 17;
                _context.t0 = _context["catch"](0);
                console.error("Swell: unable to loading settings (".concat(_context.t0, ")"));

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 17]]);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  };
}

function decodeLocaleObjects(values, locale, configs, opt) {
  if (isObject(values)) {
    var keys = Object.keys(values);

    for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
      var key = _keys[_i];

      if (key === '$locale') {
        decodeLocaleValue(locale, values, key, configs, opt);
        delete values.$locale;
      }

      if (values[key] !== undefined) {
        values[key] = decodeLocaleObjects(values[key], locale, configs, opt);
      }
    }
  } else if (values instanceof Array) {
    for (var i = 0; i < values.length; i++) {
      values[i] = decodeLocaleObjects(values[i], locale, configs, opt);
    }
  }

  return values;
}

function decodeLocaleValue(locale, values, key, configs, opt) {
  if (!locale || !isObject(values[key])) {
    return;
  }

  var returnLocaleKey;
  var returnLocaleConfig;
  var localeKeys = Object.keys(values[key]);

  for (var _i2 = 0, _localeKeys = localeKeys; _i2 < _localeKeys.length; _i2++) {
    var localeKey = _localeKeys[_i2];
    var shortKey = localeKey.replace(/\-.+$/, '');
    var transformedLocale = opt.useCamelCase ? camelCase(locale) : locale;

    if (localeKey === locale || localeKey === transformedLocale || shortKey === transformedLocale) {
      returnLocaleKey = locale;
      returnLocaleConfig = configs[locale];
    }
  } // Find configured locale for fallback


  if (!returnLocaleKey && isObject(configs)) {
    var _localeKeys2 = Object.keys(configs);

    for (var _i3 = 0, _localeKeys3 = _localeKeys2; _i3 < _localeKeys3.length; _i3++) {
      var _localeKey = _localeKeys3[_i3];

      var _shortKey = _localeKey.replace(/\-.+$/, '');

      if (_localeKey === locale || _shortKey === locale) {
        returnLocaleKey = _localeKey;
        returnLocaleConfig = configs[_localeKey];
      }
    }
  } // Find fallback key and values if applicable


  var fallbackKeys;
  var fallbackValues = {};

  if (returnLocaleConfig) {
    var fallbackKey = returnLocaleConfig.fallback;
    var origFallbackKey = fallbackKey;

    while (fallbackKey) {
      fallbackKeys = fallbackKeys || [];
      fallbackKeys.push(fallbackKey);
      fallbackValues = _objectSpread(_objectSpread({}, values[key][fallbackKey] || {}), fallbackValues);
      fallbackKey = configs[fallbackKey] && configs[fallbackKey].fallback;

      if (origFallbackKey === fallbackKey) {
        break;
      }
    }
  } // Merge locale value with fallbacks


  var localeValues = _objectSpread(_objectSpread({}, fallbackValues), values[key][returnLocaleKey] || {});

  var valueKeys = Object.keys(localeValues);

  for (var _i4 = 0, _valueKeys = valueKeys; _i4 < _valueKeys.length; _i4++) {
    var valueKey = _valueKeys[_i4];
    var hasValue = localeValues[valueKey] !== null && localeValues[valueKey] !== '';
    var shouldFallback = fallbackKeys && !hasValue;

    if (shouldFallback) {
      var _iterator = _createForOfIteratorHelper(fallbackKeys),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _fallbackKey = _step.value;
          shouldFallback = !values[key][_fallbackKey] || values[key][_fallbackKey][valueKey] === null || values[key][_fallbackKey][valueKey] === '';

          if (shouldFallback) {
            if (_fallbackKey === 'none') {
              values[valueKey] = null;
              break;
            }

            continue;
          } else {
            values[valueKey] = values[key][_fallbackKey][valueKey];
            break;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } else {
      if (hasValue) {
        values[valueKey] = localeValues[valueKey];
      }
    }
  }
}

module.exports = {
  methods: methods
};