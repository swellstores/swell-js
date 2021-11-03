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
    _set = _require.set,
    merge = _require.merge,
    toCamel = _require.toCamel,
    toCamelPath = _require.toCamelPath,
    getOptions = _require.getOptions;

var RECORD_TIMEOUT = 5000;
var VALUES = {
  /*
  [model]: {
    [id]: {
      data,
      record,
      recordTimer,
      presets,
    }
  }
  */
};
var cacheApi = {
  options: {
    enabled: true,
    debug: false
  },
  debug: function debug() {
    if (this.options.debug) {
      var _console;

      (_console = console).log.apply(_console, arguments);
    }
  },
  values: function values(_ref) {
    var model = _ref.model,
        id = _ref.id;
    var setValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    this.debug.apply(this, ['cache.values'].concat(Array.prototype.slice.call(arguments)));

    if (setValues !== undefined) {
      for (var key in setValues) {
        _set(VALUES, "".concat(model, ".").concat(id, ".").concat(key), setValues[key]);
      }

      return;
    }

    return get(VALUES, "".concat(model, ".").concat(id), {});
  },
  preset: function preset(details) {
    this.debug.apply(this, ['cache.preset'].concat(Array.prototype.slice.call(arguments)));

    var _this$values = this.values(details),
        _this$values$presets = _this$values.presets,
        presets = _this$values$presets === void 0 ? [] : _this$values$presets;

    presets.push(details);
    this.values(details, {
      presets: presets
    });
  },
  set: function set(details) {
    this.debug.apply(this, ['cache.set'].concat(Array.prototype.slice.call(arguments)));
    var model = details.model,
        id = details.id,
        path = details.path,
        value = details.value;

    var _this$values2 = this.values(details),
        _this$values2$data = _this$values2.data,
        data = _this$values2$data === void 0 ? {} : _this$values2$data,
        record = _this$values2.record,
        presets = _this$values2.presets;

    if (id === null) {
      return;
    }

    if (record === undefined) {
      return this.preset(details);
    }

    data = merge(record || {}, data);

    var _getOptions = getOptions(),
        useCamelCase = _getOptions.useCamelCase;

    if (useCamelCase && value && (0, _typeof2["default"])(value) === 'object') {
      value = toCamel(value);
    }

    if (path || value instanceof Array) {
      var upData = _objectSpread({}, data || {});

      var upPath = useCamelCase ? toCamelPath(path) : path;

      _set(upData, upPath || '', value);

      data = upData;
    } else if (value && (0, _typeof2["default"])(value) === 'object') {
      data = data || {};
      data = merge(data, value);
    } else {
      data = value;
    }

    this.values(details, {
      data: data
    });

    try {
      // Make sure values have clean refs
      var cache = VALUES[model][id];

      if (cache !== undefined) {
        if (cache.data !== undefined) {
          cache.data = JSON.parse(JSON.stringify(cache.data));
        }

        if (cache.record !== undefined) {
          cache.record = JSON.parse(JSON.stringify(cache.record));
        }
      }
    } catch (err) {// noop
    }
  },
  get: function get(model, id) {
    this.debug.apply(this, ['cache.get'].concat(Array.prototype.slice.call(arguments)));

    var _this$values3 = this.values({
      model: model,
      id: id
    }),
        data = _this$values3.data,
        recordTimer = _this$values3.recordTimer;

    this.debug.apply(this, ['cache.get:data+recordTimer'].concat(Array.prototype.slice.call(arguments)));

    if (recordTimer) {
      return data;
    }
  },
  setRecord: function setRecord(record, details) {
    var _this = this;

    this.debug.apply(this, ['cache.setRecord'].concat(Array.prototype.slice.call(arguments)));

    var _this$values4 = this.values(details),
        recordTimer = _this$values4.recordTimer,
        presets = _this$values4.presets;

    if (recordTimer) {
      clearTimeout(recordTimer);
    }

    recordTimer = setTimeout(function () {
      _this.values(details, {
        record: undefined,
        recordTimer: undefined
      });
    }, RECORD_TIMEOUT); // Record has to be null at minimum, not undefined

    this.values(details, {
      record: record !== undefined ? record : null,
      recordTimer: recordTimer
    });

    if (presets) {
      var _iterator = _createForOfIteratorHelper(presets),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var preset = _step.value;
          this.set(preset);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.values(details, {
        presets: undefined
      });
    }

    var result = this.get(details.model, details.id);
    return result !== undefined ? result : record;
  },
  getFetch: function () {
    var _getFetch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(model, id, fetch) {
      var value,
          record,
          _args = arguments;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!this.options.enabled) {
                _context.next = 5;
                break;
              }

              this.debug.apply(this, ['cache.getFetch'].concat(Array.prototype.slice.call(_args)));
              value = this.get(model, id);

              if (!(value !== undefined)) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return", value);

            case 5:
              _context.next = 7;
              return fetch();

            case 7:
              record = _context.sent;
              return _context.abrupt("return", this.setRecord(record, {
                model: model,
                id: id
              }));

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function getFetch(_x, _x2, _x3) {
      return _getFetch.apply(this, arguments);
    }

    return getFetch;
  }(),
  clear: function clear() {
    var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    this.debug.apply(this, ['cache.clear'].concat(Array.prototype.slice.call(arguments)));

    if (model) {
      if (id) {
        _set(VALUES, "".concat(model, ".").concat(id), undefined);
      } else {
        _set(VALUES, model, undefined);
      }
    } else {
      VALUES = {};
    }
  }
};
module.exports = cacheApi;