"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var card = require('./card');

var _require = require('./utils'),
    toCamel = _require.toCamel,
    toSnake = _require.toSnake,
    trimBoth = _require.trimBoth,
    trimStart = _require.trimStart,
    trimEnd = _require.trimEnd,
    stringifyQuery = _require.stringifyQuery;

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
    card.init(options, request);
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
  products: {
    get: function get(id, query) {
      return request('get', '/products', id, query);
    }
  },
  categories: {
    get: function get(id, query) {
      return request('get', '/categories', id, query);
    }
  },
  cart: {
    state: null,
    order: null,
    settings: null,
    requestStateChange: function () {
      var _requestStateChange = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(method, url, id, data) {
        var result;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return request(method, url, id, data);

              case 2:
                result = _context.sent;

                if (!(result && result.errors)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", result);

              case 5:
                this.state = result;
                return _context.abrupt("return", result);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function requestStateChange(_x, _x2, _x3, _x4) {
        return _requestStateChange.apply(this, arguments);
      }

      return requestStateChange;
    }(),
    get: function get() {
      return this.requestStateChange('get', '/cart');
    },
    addItem: function addItem(item) {
      if (typeof item === 'string') {
        return this.requestStateChange('post', '/cart/items', {
          product_id: item
        });
      }

      return this.requestStateChange('post', '/cart/items', item);
    },
    setItems: function setItems(items) {
      return this.requestStateChange('put', '/cart/items', items);
    },
    updateItem: function updateItem(id, item) {
      return this.requestStateChange('put', "/cart/items/".concat(id), item);
    },
    removeItem: function removeItem(id) {
      return this.requestStateChange('delete', "/cart/items/".concat(id));
    },
    recover: function recover(checkoutId) {
      return this.requestStateChange('put', "/cart/recover/".concat(checkoutId));
    },
    update: function update(data) {
      return this.requestStateChange('put', "/cart", data);
    },
    applyCoupon: function applyCoupon(code) {
      return this.requestStateChange('put', '/cart/coupon', {
        code: code
      });
    },
    removeCoupon: function removeCoupon() {
      return this.requestStateChange('delete', '/cart/coupon');
    },
    applyGiftcard: function applyGiftcard(code) {
      return this.requestStateChange('post', '/cart/giftcards', {
        code: code
      });
    },
    removeGiftcard: function removeGiftcard(id) {
      return this.requestStateChange('delete', "/cart/giftcards/".concat(id));
    },
    getShippingRates: function () {
      var _getShippingRates = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.requestStateChange('get', '/cart/shipment-rating');

              case 2:
                return _context2.abrupt("return", this.state[options.useCamelCase ? 'shipmentRating' : 'shipment_rating']);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getShippingRates() {
        return _getShippingRates.apply(this, arguments);
      }

      return getShippingRates;
    }(),
    submitOrder: function () {
      var _submitOrder = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
        var result;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return request('post', '/cart/order');

              case 2:
                result = _context3.sent;

                if (!result.errors) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", result);

              case 5:
                this.state = null;
                this.order = result;
                return _context3.abrupt("return", result);

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function submitOrder() {
        return _submitOrder.apply(this, arguments);
      }

      return submitOrder;
    }(),
    getOrder: function () {
      var _getOrder = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee4() {
        var checkoutId,
            result,
            _args4 = arguments;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                checkoutId = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : undefined;

                if (!checkoutId) {
                  _context4.next = 7;
                  break;
                }

                _context4.next = 4;
                return request('get', "/cart/order", {
                  checkout_id: checkoutId
                });

              case 4:
                result = _context4.sent;
                _context4.next = 10;
                break;

              case 7:
                _context4.next = 9;
                return request('get', "/cart/order");

              case 9:
                result = _context4.sent;

              case 10:
                this.order = result;
                return _context4.abrupt("return", result);

              case 12:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getOrder() {
        return _getOrder.apply(this, arguments);
      }

      return getOrder;
    }(),
    getSettings: function () {
      var _getSettings = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee5() {
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return request('get', '/cart/settings');

              case 2:
                this.settings = _context5.sent;
                return _context5.abrupt("return", this.settings);

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getSettings() {
        return _getSettings.apply(this, arguments);
      }

      return getSettings;
    }()
  },
  subscriptions: {
    get: function get(id, query) {
      return request('get', '/subscriptions', id, query);
    },
    create: function create(data) {
      return request('post', '/subscriptions', data);
    },
    update: function update(id, data) {
      return request('put', "/subscriptions/".concat(id), data);
    },
    addItem: function addItem(id, item) {
      return request('post', "/subscriptions/".concat(id, "/items"), item);
    },
    setItems: function setItems(id, items) {
      return request('put', "/subscriptions/".concat(id, "/items"), items);
    },
    updateItem: function updateItem(id, itemId, item) {
      return request('put', "/subscriptions/".concat(id, "/items/").concat(itemId), item);
    },
    removeItem: function removeItem(id, itemId) {
      return request('delete', "/subscriptions/".concat(id, "/items/").concat(itemId));
    }
  },
  account: {
    state: null,
    requestStateChange: function () {
      var _requestStateChange2 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee6(method, url, id, data) {
        var result;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return request(method, url, id, data);

              case 2:
                result = _context6.sent;

                if (!(result && result.errors)) {
                  _context6.next = 5;
                  break;
                }

                return _context6.abrupt("return", result);

              case 5:
                return _context6.abrupt("return", this.state = result);

              case 6:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function requestStateChange(_x5, _x6, _x7, _x8) {
        return _requestStateChange2.apply(this, arguments);
      }

      return requestStateChange;
    }(),
    get: function get() {
      return this.requestStateChange('get', '/account');
    },
    create: function create(data) {
      return this.requestStateChange('post', '/account', data);
    },
    update: function update(data) {
      return this.requestStateChange('put', '/account', data);
    },
    login: function login(email, password) {
      return this.requestStateChange('post', '/account/login', {
        email: email,
        password: password
      });
    },
    logout: function logout() {
      this.state = null;
      return request('post', '/account/logout');
    },
    recover: function recover(data) {
      return request('post', '/account/recover', data);
    },
    getAddresses: function getAddresses(query) {
      return request('get', '/account/addresses', query);
    },
    createAddress: function createAddress(data) {
      return request('post', '/account/addresses', data);
    },
    deleteAddress: function deleteAddress(id) {
      return request('delete', "/account/addresses/".concat(id));
    },
    getCards: function getCards(query) {
      return request('get', '/account/cards', query);
    },
    createCard: function createCard(data) {
      return request('post', '/account/cards', data);
    },
    deleteCard: function deleteCard(id) {
      return request('delete', "/account/cards/".concat(id));
    },
    getOrders: function getOrders(query) {
      return request('get', "/account/orders", query);
    }
  },
  card: card
};

function request(_x9, _x10) {
  return _request.apply(this, arguments);
}

function _request() {
  _request = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee7(method, url) {
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
        reqHeaders,
        response,
        result,
        err,
        _err,
        _args7 = arguments;

    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : undefined;
            data = _args7.length > 3 && _args7[3] !== undefined ? _args7[3] : undefined;
            opt = _args7.length > 4 && _args7[4] !== undefined ? _args7[4] : undefined;
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

            reqHeaders = new Headers({
              'Content-Type': 'application/json',
              Authorization: "Basic ".concat(Buffer.from(allOptions.key).toString('base64'))
            });
            _context7.next = 15;
            return fetch(reqUrl, {
              method: reqMethod,
              headers: reqHeaders,
              body: reqBody,
              credentials: 'include',
              mode: 'cors'
            });

          case 15:
            response = _context7.sent;
            _context7.next = 18;
            return response.json();

          case 18:
            result = _context7.sent;

            if (!(result && result.error)) {
              _context7.next = 27;
              break;
            }

            err = new Error(result.error.message);
            err.status = response.status;
            err.code = result.error.code;
            err.param = result.error.param;
            throw err;

          case 27:
            if (response.ok) {
              _context7.next = 31;
              break;
            }

            _err = new Error('A connection error occurred while making the request');
            _err.code = 'connection_error';
            throw _err;

          case 31:
            return _context7.abrupt("return", options.useCamelCase ? toCamel(result) : result);

          case 32:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _request.apply(this, arguments);
}

module.exports = api;