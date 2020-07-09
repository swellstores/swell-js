"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _readOnlyError2 = _interopRequireDefault(require("@babel/runtime/helpers/readOnlyError"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('./utils'),
    _get = _require.get,
    _set = _require.set,
    merge = _require.merge,
    toCamel = _require.toCamel,
    getOptions = _require.getOptions;

var VALUES = {
  /*
  [model]: {
    [id]: {
      counter,
      data,
    }
  }
  */
};
var ONCE_TIMER;
var cacheApi = {
  set: function set(_ref) {
    var model = _ref.model,
        id = _ref.id,
        path = _ref.path,
        value = _ref.value;
    var once = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var data = _get(VALUES, "".concat(model, ".").concat(id, ".data"));

    if (id === null || path && data === undefined || data === null) {
      return;
    }

    var _getOptions = getOptions(),
        useCamelCase = _getOptions.useCamelCase;

    if (useCamelCase && value && (0, _typeof2["default"])(value) === 'object') {
      value = toCamel(value);
    }

    var mergeData = {};

    if (value instanceof Array) {
      var upData = _objectSpread({}, data);

      _set(upData, path || '', value);

      if (useCamelCase) {
        upData = ((0, _readOnlyError2["default"])("upData"), toCamel(upData));
      }

      data = upData;
    } else if (path) {
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

    _set(VALUES, "".concat(model, ".").concat(id, ".data"), data);

    if (once) {
      _set(VALUES, "".concat(model, ".").concat(id, ".counter"), _get(VALUES, "".concat(model, ".").concat(id, ".counter"), -1) + 1);
    } // Make sure values have clean refs


    if (VALUES[model][id] !== undefined) {
      VALUES[model][id] = JSON.parse(JSON.stringify(VALUES[model][id]));
    }
  },
  setOnce: function setOnce(details) {
    if (ONCE_TIMER) {
      clearTimeout(ONCE_TIMER);
    }

    ONCE_TIMER = setTimeout(function () {
      return ONCE_TIMER = null;
    }, 1000);
    return this.set(details, true);
  },
  get: function get(model, id) {
    return _get(VALUES, "".concat(model, ".").concat(id, ".data"));
  },
  getOnce: function getOnce(model, id) {
    var obj = _get(VALUES, "".concat(model, ".").concat(id));

    if (obj) {
      if (obj.counter > 0) {
        obj.counter--;

        if (obj.data && (0, _typeof2["default"])(obj.data) === 'object') {
          return _objectSpread({}, obj.data);
        }

        return obj.data;
      }

      if (ONCE_TIMER) {
        if (obj.data && (0, _typeof2["default"])(obj.data) === 'object') {
          return _objectSpread({}, obj.data);
        }

        return obj.data;
      }
    }
  },
  getSetOnce: function () {
    var _getSetOnce = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(model, id, getter) {
      var value;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              value = this.getOnce(model, id);

              if (!(value !== undefined)) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", value);

            case 3:
              _context.next = 5;
              return getter();

            case 5:
              value = _context.sent;
              this.setOnce({
                model: model,
                id: id,
                value: value
              });
              return _context.abrupt("return", value);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function getSetOnce(_x, _x2, _x3) {
      return _getSetOnce.apply(this, arguments);
    }

    return getSetOnce;
  }(),
  clear: function clear() {
    var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    if (model) {
      if (id) {
        if (path) {
          _set(VALUES, "".concat(model, ".").concat(id, ".").concat(path), undefined);
        } else {
          _set(VALUES, "".concat(model, ".").concat(id), undefined);
        }
      } else {
        _set(VALUES, model, undefined);
      }
    } else {
      VALUES = {};
    }
  }
};
module.exports = cacheApi;