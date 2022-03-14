"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var card = require('./card');

var _require = require('./cookie'),
    getCookie = _require.getCookie,
    setCookie = _require.setCookie;

var _require2 = require('./utils'),
    setOptions = _require2.setOptions,
    toCamel = _require2.toCamel,
    toSnake = _require2.toSnake,
    trimBoth = _require2.trimBoth,
    trimStart = _require2.trimStart,
    trimEnd = _require2.trimEnd,
    stringifyQuery = _require2.stringifyQuery,
    base64Encode = _require2.base64Encode;

var cache = require('./cache');

var cart = require('./cart');

var account = require('./account');

var products = require('./products');

var categories = require('./categories');

var attributes = require('./attributes');

var subscriptions = require('./subscriptions');

var content = require('./content');

var settings = require('./settings');

var payment = require('./payment');

var locale = require('./locale');

var currency = require('./currency');

require('isomorphic-fetch');

var options = {
  store: null,
  key: null,
  url: null,
  useCamelCase: null,
  previewContent: null
};
var api = {
  options: options,
  request: request,
  init: function init(store, key) {
    var opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    options.key = key;
    options.store = store;
    options.url = opt.url ? trimEnd(opt.url) : "https://".concat(store, ".swell.store");
    options.vaultUrl = opt.vaultUrl ? trimEnd(opt.vaultUrl) : "https://vault.schema.io";
    options.timeout = opt.timeout && parseInt(opt.timeout, 10) || 20000;
    options.useCamelCase = opt.useCamelCase || false;
    options.previewContent = opt.previewContent || false;
    options.session = opt.session;
    options.locale = opt.locale;
    options.currency = opt.currency;
    options.api = api;
    setOptions(options);
  },
  // Backward compatibility
  auth: function auth() {
    return this.init.apply(this, arguments);
  },
  get: function get(url, query) {
    return request('get', url, query);
  },
  put: function put(url, data) {
    return request('put', url, data);
  },
  post: function post(url, data) {
    return request('post', url, data);
  },
  "delete": function _delete(url, data) {
    return request('delete', url, data);
  },
  cache: cache,
  card: card,
  cart: cart.methods(request, options),
  account: account.methods(request, options),
  products: products.methods(request, options),
  categories: categories.methods(request, options),
  attributes: attributes.methods(request, options),
  subscriptions: subscriptions.methods(request, options),
  content: content.methods(request, options),
  settings: settings.methods(request, options),
  payment: payment.methods(request, options),
  locale: locale.methods(request, options),
  currency: currency.methods(request, options)
};

function request(_x, _x2) {
  return _request.apply(this, arguments);
}

function _request() {
  _request = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(method, url) {
    var id,
        data,
        opt,
        allOptions,
        session,
        locale,
        currency,
        baseUrl,
        reqMethod,
        reqUrl,
        reqData,
        reqBody,
        exQuery,
        _reqUrl$split,
        _reqUrl$split2,
        fullQuery,
        reqHeaders,
        response,
        responseSession,
        result,
        err,
        _err,
        _args = arguments;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            id = _args.length > 2 && _args[2] !== undefined ? _args[2] : undefined;
            data = _args.length > 3 && _args[3] !== undefined ? _args[3] : undefined;
            opt = _args.length > 4 && _args[4] !== undefined ? _args[4] : undefined;
            allOptions = _objectSpread(_objectSpread({}, options), opt);
            session = allOptions.session || getCookie('swell-session');
            locale = allOptions.locale || getCookie('swell-locale');
            currency = allOptions.currency || getCookie('swell-currency');
            baseUrl = "".concat(allOptions.url).concat(allOptions.base || '', "/api");
            reqMethod = String(method).toLowerCase();
            reqUrl = url;
            reqData = id;

            if (data !== undefined || typeof id === 'string') {
              reqUrl = [trimEnd(url), trimStart(id)].join('/');
              reqData = data;
            }

            reqUrl = allOptions.fullUrl || "".concat(baseUrl, "/").concat(trimBoth(reqUrl));
            reqData = allOptions.useCamelCase ? toSnake(reqData) : reqData;

            if (reqMethod === 'get') {
              _reqUrl$split = reqUrl.split('?');
              _reqUrl$split2 = (0, _slicedToArray2["default"])(_reqUrl$split, 2);
              reqUrl = _reqUrl$split2[0];
              exQuery = _reqUrl$split2[1];
              fullQuery = [exQuery, stringifyQuery(reqData)].join('&').replace(/^&/, '');
              reqUrl = "".concat(reqUrl).concat(fullQuery ? "?".concat(fullQuery) : '');
            } else {
              reqBody = JSON.stringify(reqData);
            }

            reqHeaders = _objectSpread(_objectSpread(_objectSpread({
              'Content-Type': 'application/json',
              Authorization: "Basic ".concat(base64Encode(String(allOptions.key)))
            }, session ? {
              'X-Session': session
            } : {}), locale ? {
              'X-Locale': locale
            } : {}), currency ? {
              'X-Currency': currency
            } : {});
            _context.next = 18;
            return fetch(reqUrl, {
              method: reqMethod,
              headers: reqHeaders,
              body: reqBody,
              credentials: 'include',
              mode: 'cors'
            });

          case 18:
            response = _context.sent;
            responseSession = response.headers.get('X-Session');

            if (typeof responseSession === 'string' && session !== responseSession) {
              setCookie('swell-session', responseSession);
            }

            _context.next = 23;
            return response.json();

          case 23:
            result = _context.sent;

            if (!(result && result.error)) {
              _context.next = 32;
              break;
            }

            err = new Error(result.error.message);
            err.status = response.status;
            err.code = result.error.code;
            err.param = result.error.param;
            throw err;

          case 32:
            if (response.ok) {
              _context.next = 36;
              break;
            }

            _err = new Error('A connection error occurred while making the request');
            _err.code = 'connection_error';
            throw _err;

          case 36:
            return _context.abrupt("return", options.useCamelCase ? toCamel(result) : result);

          case 37:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _request.apply(this, arguments);
}

if (typeof window !== 'undefined') {
  window.swell = {
    version: '3.13.0'
  };
}

module.exports = api;