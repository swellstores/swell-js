"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('./utils'),
    get = _require.get,
    _set = _require.set,
    merge = _require.merge,
    toCamel = _require.toCamel,
    getOptions = _require.getOptions;

var DEBUG = false; // true to enable debug logs

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

function debug() {
  if (DEBUG) {
    var _console;

    (_console = console).log.apply(_console, arguments);
  }
}

var cacheApi = {
  values: function values(_ref) {
    var model = _ref.model,
        id = _ref.id;
    var setValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    debug.apply(void 0, ['cache.values'].concat(Array.prototype.slice.call(arguments)));

    if (setValues !== undefined) {
      for (var key in setValues) {
        _set(VALUES, "".concat(model, ".").concat(id, ".").concat(key), setValues[key]);
      }

      return;
    }

    return get(VALUES, "".concat(model, ".").concat(id), {});
  },
  preset: function preset(details) {
    debug.apply(void 0, ['cache.preset'].concat(Array.prototype.slice.call(arguments)));

    var _this$values = this.values(details),
        _this$values$presets = _this$values.presets,
        presets = _this$values$presets === void 0 ? [] : _this$values$presets;

    presets.push(details);
    this.values(details, {
      presets: presets
    });
  },
  set: function set(details) {
    debug.apply(void 0, ['cache.set'].concat(Array.prototype.slice.call(arguments)));
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

    var mergeData = {};

    if (value instanceof Array) {
      var upData = _objectSpread({}, data || {});

      _set(upData, path || '', value);

      if (useCamelCase) {
        upData = toCamel(upData);
      }

      data = upData;
    } else if (path) {
      data = data || {};

      _set(mergeData, path || '', value);

      if (useCamelCase) {
        mergeData = toCamel(mergeData);
      }

      data = merge(data, mergeData);
    } else if (value && (0, _typeof2["default"])(value) === 'object') {
      data = data || {};
      data = merge(data, value);
    } else {
      data = value;
    }

    this.values(details, {
      data: data
    }); // Make sure values have clean refs

    if (VALUES[model][id] !== undefined) {
      VALUES[model][id] = JSON.parse(JSON.stringify(VALUES[model][id]));
    }
  },
  get: function get(model, id) {
    debug.apply(void 0, ['cache.get'].concat(Array.prototype.slice.call(arguments)));

    var _this$values3 = this.values({
      model: model,
      id: id
    }),
        data = _this$values3.data,
        recordTimer = _this$values3.recordTimer;

    debug.apply(void 0, ['cache.get:data+recordTimer'].concat(Array.prototype.slice.call(arguments)));

    if (recordTimer) {
      return data;
    }
  },
  setRecord: function setRecord(record, details) {
    var _this = this;

    debug.apply(void 0, ['cache.setRecord'].concat(Array.prototype.slice.call(arguments)));

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
    }, RECORD_TIMEOUT); // Record has to be an empty object at minimum

    this.values(details, {
      record: record,
      recordTimer: recordTimer
    });

    if (presets) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = presets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var preset = _step.value;
          this.set(preset);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
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
              debug.apply(void 0, ['cache.getFetch'].concat(Array.prototype.slice.call(_args)));
              value = this.get(model, id);

              if (!(value !== undefined)) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", value);

            case 4:
              _context.next = 6;
              return fetch();

            case 6:
              record = _context.sent;
              return _context.abrupt("return", this.setRecord(record, {
                model: model,
                id: id
              }));

            case 8:
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
    debug.apply(void 0, ['cache.clear'].concat(Array.prototype.slice.call(arguments)));

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