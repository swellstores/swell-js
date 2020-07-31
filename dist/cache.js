"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

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
      data,
    }
  }
  */
};
var cacheApi = {
  set: function set(_ref) {
    var model = _ref.model,
        id = _ref.id,
        path = _ref.path,
        value = _ref.value;

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
        upData = toCamel(upData);
      }

      data = upData;
    } else if (path) {
      _set(data, path, value); // TODO: make sure this is the right approach
      // set(mergeData, path || '', value);
      // if (useCamelCase) {
      //   mergeData = toCamel(mergeData);
      // }
      // data = merge(data, mergeData);

    } else if (value && (0, _typeof2["default"])(value) === 'object') {
      data = data || {};
      data = merge(data, value);
    } else {
      data = value;
    }

    _set(VALUES, "".concat(model, ".").concat(id, ".data"), data); // Make sure values have clean refs


    if (VALUES[model][id] !== undefined) {
      VALUES[model][id] = JSON.parse(JSON.stringify(VALUES[model][id]));
    }
  },
  get: function get(model, id) {
    return _get(VALUES, "".concat(model, ".").concat(id, ".data"));
  },
  getFetch: function getFetch(model, id, fetch) {
    var value = this.get(model, id);

    if (value !== undefined) {
      return value;
    }

    return fetch();
  },
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