"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var card = require('./card');

var _require = require('./cookie'),
    getCookie = _require.getCookie,
    setCookie = _require.setCookie;

var _require2 = require('./utils'),
    toCamel = _require2.toCamel,
    toSnake = _require2.toSnake,
    trimBoth = _require2.trimBoth,
    trimStart = _require2.trimStart,
    trimEnd = _require2.trimEnd,
    stringifyQuery = _require2.stringifyQuery;

var cart = require('./cart');

var account = require('./account');

var products = require('./products');

var categories = require('./categories');

var subscriptions = require('./subscriptions');

require('isomorphic-fetch');

var options = {
  store: null,
  key: null,
  url: null,
  useCamelCase: null
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
    options.useCamelCase = opt.useCamelCase || false;
    card.options = options;
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
  card: card,
  cart: cart.methods(request, options),
  account: account.methods(request),
  products: products.methods(request),
  categories: categories.methods(request),
  subscriptions: subscriptions.methods(request)
};

function request(_x, _x2) {
  return _request.apply(this, arguments);
}

function _request() {
  _request = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(method, url) {
    var id,
        data,
        opt,
        reqMethod,
        reqUrl,
        reqData,
        allOptions,
        baseUrl,
        reqBody,
        exQuery,
        _reqUrl$split,
        _reqUrl$split2,
        fullQuery,
        session,
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
            reqMethod = String(method).toLowerCase();
            reqUrl = url;
            reqData = id;

            if (data !== undefined || typeof id === 'string') {
              reqUrl = [trimEnd(url), trimStart(id)].join('/');
              reqData = data;
            }

            allOptions = (0, _objectSpread2["default"])({}, options, opt);
            baseUrl = "".concat(allOptions.url).concat(allOptions.base || '', "/api");
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

            session = getCookie('swell-session');
            reqHeaders = (0, _objectSpread2["default"])({
              'Content-Type': 'application/json',
              Authorization: "Basic ".concat(Buffer.from(allOptions.key).toString('base64'))
            }, session ? {
              'X-Session': session
            } : {});
            _context.next = 16;
            return fetch(reqUrl, {
              method: reqMethod,
              headers: reqHeaders,
              body: reqBody,
              credentials: 'include',
              mode: 'cors'
            });

          case 16:
            response = _context.sent;
            responseSession = response.headers.get('X-Session');

            if (typeof responseSession === 'string' && session !== responseSession) {
              setCookie('swell-session', responseSession);
            }

            _context.next = 21;
            return response.json();

          case 21:
            result = _context.sent;

            if (!(result && result.error)) {
              _context.next = 30;
              break;
            }

            err = new Error(result.error.message);
            err.status = response.status;
            err.code = result.error.code;
            err.param = result.error.param;
            throw err;

          case 30:
            if (response.ok) {
              _context.next = 34;
              break;
            }

            _err = new Error('A connection error occurred while making the request');
            _err.code = 'connection_error';
            throw _err;

          case 34:
            return _context.abrupt("return", options.useCamelCase ? toCamel(result) : result);

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _request.apply(this, arguments);
}

module.exports = api;