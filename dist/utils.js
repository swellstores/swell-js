"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var qs = require('qs');

var set = require('lodash/set');

var get = require('lodash/get');

var deepmerge = require('deepmerge');

var _require = require('object-keys-normalizer'),
    normalizeKeys = _require.normalizeKeys;

var options = {};

function merge(x, y) {
  return deepmerge(x, y, {
    arrayMerge: arrayMerge
  });
}

function arrayMerge(target, source, options) {
  var destination = target.slice();
  source.forEach(function (item, index) {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
}

function setOptions(optns) {
  options = optns;
}

function isObject(val) {
  return val && (0, _typeof2["default"])(val) === 'object' && !(val instanceof Array);
}

function toCamel(obj) {
  var reserved = isObject(obj) ? Object.keys(obj).reduce(function (acc, key) {
    if (key[0] === '$') {
      var value = obj[key];
      delete obj[key];
      return _objectSpread({}, acc, (0, _defineProperty2["default"])({}, key, value));
    }

    return acc;
  }, {}) : null;
  var normal = normalizeKeys(obj, 'camel');

  if (reserved) {
    return _objectSpread({}, normal, {}, reserved);
  }

  return normal;
}

function toSnake(obj) {
  if (!obj) return; // Make a copy to avoid mutating source object

  var objCopy = JSON.parse(JSON.stringify(obj));
  var reserved = isObject(objCopy) ? Object.keys(objCopy).reduce(function (acc, key) {
    if (key[0] === '$') {
      var value = objCopy[key];
      delete objCopy[key];
      return _objectSpread({}, acc, (0, _defineProperty2["default"])({}, key, value));
    }

    return acc;
  }, {}) : null;
  var normal = normalizeKeys(objCopy, 'snake');

  if (reserved) {
    return _objectSpread({}, normal, {}, reserved);
  }

  return normal;
}

function trimBoth(str) {
  return trimStart(trimEnd(str));
}

function trimStart(str) {
  return typeof str === 'string' ? str.replace(/^[/]+/, '') : '';
}

function trimEnd(str) {
  return typeof str === 'string' ? str.replace(/[/]+$/, '') : '';
}

function stringifyQuery(str) {
  return qs.stringify(str, {
    depth: 10,
    encode: false
  });
}

function map(arr, cb) {
  return arr instanceof Array ? arr.map(cb) : [];
}

function reduce(arr, cb, init) {
  return arr instanceof Array ? arr.reduce(cb, init) : init;
}

function isServer() {
  return !(typeof window !== 'undefined' && window.document);
}

function isFunction(func) {
  return typeof func === 'function';
}

function defaultMethods(request, uri, methods) {
  return {
    list: methods.indexOf('list') >= 0 ? function (query) {
      return request('get', uri, undefined, query);
    } : undefined,
    get: methods.indexOf('get') >= 0 ? function (id, query) {
      return request('get', uri, id, query);
    } : undefined
  };
}

function vaultRequest(_x, _x2, _x3) {
  return _vaultRequest.apply(this, arguments);
}

function _vaultRequest() {
  _vaultRequest = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(method, url, data) {
    var opt,
        vaultUrl,
        timeout,
        requestId,
        callback,
        _args = arguments;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            opt = _args.length > 3 && _args[3] !== undefined ? _args[3] : undefined;
            vaultUrl = options.vaultUrl;
            timeout = options.timeout;
            requestId = vaultRequestId();
            callback = "swell_vault_response_".concat(requestId);
            data = {
              $jsonp: {
                method: method,
                callback: callback
              },
              $data: data,
              $key: options.key
            };
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              var script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = "".concat(trimEnd(vaultUrl), "/").concat(trimStart(url), "?").concat(serializeData(data));
              var errorTimeout = setTimeout(function () {
                window[callback]({
                  $error: "Request timed out after ".concat(timeout / 1000, " seconds"),
                  $status: 500
                });
              }, timeout);

              window[callback] = function (result) {
                clearTimeout(errorTimeout);

                if (result && result.$error) {
                  var err = new Error(result.$error);
                  err.code = 'request_error';
                  err.status = result.$status;
                  reject(err);
                } else if (!result || result.$status >= 300) {
                  var _err = new Error('A connection error occurred while making the request');

                  _err.code = 'connection_error';
                  _err.status = result.$status;
                  reject(_err);
                } else {
                  resolve(options.useCamelCase ? toCamel(result.$data) : result.$data);
                }

                delete window[callback];
                script.parentNode.removeChild(script);
              };

              document.getElementsByTagName('head')[0].appendChild(script);
            }));

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _vaultRequest.apply(this, arguments);
}

function vaultRequestId() {
  window.__swell_vault_request_id = window.__swell_vault_request_id || 0;
  window.__swell_vault_request_id++;
  return window.__swell_vault_request_id;
}

function serializeData(data) {
  var key;
  var s = [];

  var add = function add(key, value) {
    // If value is a function, invoke it and return its value
    if (typeof value === 'function') {
      value = value();
    } else if (value == null) {
      value = '';
    }

    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  };

  for (var _key in data) {
    buildParams(_key, data[_key], add);
  }

  return s.join('&').replace(' ', '+');
}

var rbracket = /\[\]$/;

function buildParams(key, obj, add) {
  var name;

  if (obj instanceof Array) {
    for (var i = 0; i < obj.length; i++) {
      if (rbracket.test(key)) {
        // Treat each array item as a scalar.
        add(key, v);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(key + '[' + ((typeof v === "undefined" ? "undefined" : (0, _typeof2["default"])(v)) === 'object' && v != null ? i : '') + ']', v, add);
      }
    }
  } else if (obj && (0, _typeof2["default"])(obj) === 'object') {
    // Serialize object item.
    for (name in obj) {
      buildParams(key + '[' + name + ']', obj[name], add);
    }
  } else {
    // Serialize scalar item.
    add(key, obj);
  }
}

module.exports = {
  set: set,
  get: get,
  merge: merge,
  setOptions: setOptions,
  toCamel: toCamel,
  toSnake: toSnake,
  trimBoth: trimBoth,
  trimStart: trimStart,
  trimEnd: trimEnd,
  stringifyQuery: stringifyQuery,
  isServer: isServer,
  isFunction: isFunction,
  map: map,
  reduce: reduce,
  defaultMethods: defaultMethods,
  vaultRequest: vaultRequest
};