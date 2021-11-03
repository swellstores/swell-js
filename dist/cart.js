"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('./utils'),
    cloneDeep = _require.cloneDeep;

var _require2 = require('./products'),
    cleanProductOptions = _require2.cleanProductOptions;

function methods(request, options) {
  return {
    state: null,
    order: null,
    settings: null,
    requested: false,
    pendingRequests: [],
    cacheClear: null,
    requestStateChange: function () {
      var _requestStateChange = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(method, url, id, data) {
        var _this = this;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", this.requestStateSync( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
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
                          _this.state = result;
                          return _context.abrupt("return", result);

                        case 7:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }))));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function requestStateChange(_x, _x2, _x3, _x4) {
        return _requestStateChange.apply(this, arguments);
      }

      return requestStateChange;
    }(),
    requestStateSync: function () {
      var _requestStateSync = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(handler) {
        var _this2 = this;

        var result, _this$pendingRequests, _handler, resolve;

        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!this.state) {
                  _context3.next = 6;
                  break;
                }

                _context3.next = 3;
                return handler();

              case 3:
                return _context3.abrupt("return", _context3.sent);

              case 6:
                if (!this.requested) {
                  _context3.next = 8;
                  break;
                }

                return _context3.abrupt("return", new Promise(function (resolve) {
                  _this2.pendingRequests.push({
                    handler: handler,
                    resolve: resolve
                  });
                }));

              case 8:
                this.requested = true;
                _context3.next = 11;
                return handler();

              case 11:
                result = _context3.sent;
                this.requested = false;

                while (this.pendingRequests.length > 0) {
                  _this$pendingRequests = this.pendingRequests.shift(), _handler = _this$pendingRequests.handler, resolve = _this$pendingRequests.resolve;
                  resolve(_handler());
                }

                return _context3.abrupt("return", result);

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function requestStateSync(_x5) {
        return _requestStateSync.apply(this, arguments);
      }

      return requestStateSync;
    }(),
    get: function get() {
      var data;

      if (this.cacheClear) {
        this.cacheClear = null;
        data = {
          $cache: false
        };
      }

      return this.requestStateChange('get', '/cart', undefined, data);
    },
    clearCache: function clearCache() {
      this.cacheClear = true;
    },
    getItemData: function getItemData(item) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var result = cloneDeep(item);

      if (typeof item === 'string') {
        result = _objectSpread(_objectSpread({}, data || {}), {}, {
          product_id: item
        });
      }

      if (result && result.options) {
        result.options = cleanProductOptions(result.options);
      }

      return result;
    },
    addItem: function addItem(item, data) {
      return this.requestStateChange('post', '/cart/items', this.getItemData(item, data));
    },
    updateItem: function updateItem(id, item) {
      return this.requestStateChange('put', "/cart/items/".concat(id), this.getItemData(item));
    },
    setItems: function setItems(input) {
      var items = input;

      if (items && items.map) {
        items = items.map(this.getItemData);
      }

      return this.requestStateChange('put', '/cart/items', items);
    },
    removeItem: function removeItem(id) {
      return this.requestStateChange('delete', "/cart/items/".concat(id));
    },
    recover: function recover(checkoutId) {
      return this.requestStateChange('put', "/cart/recover/".concat(checkoutId));
    },
    update: function update(input) {
      var data = input;

      if (data.items && data.items.map) {
        data = _objectSpread(_objectSpread({}, data), {}, {
          items: data.items.map(this.getItemData)
        });
      }

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
      var _getShippingRates = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.requestStateChange('get', '/cart/shipment-rating');

              case 2:
                return _context4.abrupt("return", this.state[options.useCamelCase ? 'shipmentRating' : 'shipment_rating']);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getShippingRates() {
        return _getShippingRates.apply(this, arguments);
      }

      return getShippingRates;
    }(),
    submitOrder: function () {
      var _submitOrder = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
        var result;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return request('post', '/cart/order');

              case 2:
                result = _context5.sent;

                if (!result.errors) {
                  _context5.next = 5;
                  break;
                }

                return _context5.abrupt("return", result);

              case 5:
                this.state = null;
                this.order = result;
                return _context5.abrupt("return", result);

              case 8:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function submitOrder() {
        return _submitOrder.apply(this, arguments);
      }

      return submitOrder;
    }(),
    getOrder: function () {
      var _getOrder = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
        var checkoutId,
            result,
            _args6 = arguments;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                checkoutId = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : undefined;

                if (!checkoutId) {
                  _context6.next = 7;
                  break;
                }

                _context6.next = 4;
                return request('get', "/cart/order", {
                  checkout_id: checkoutId
                });

              case 4:
                result = _context6.sent;
                _context6.next = 10;
                break;

              case 7:
                _context6.next = 9;
                return request('get', "/cart/order");

              case 9:
                result = _context6.sent;

              case 10:
                this.order = result;
                return _context6.abrupt("return", result);

              case 12:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getOrder() {
        return _getOrder.apply(this, arguments);
      }

      return getOrder;
    }(),
    getSettings: function () {
      var _getSettings = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return request('get', '/cart/settings');

              case 2:
                this.settings = _context7.sent;
                return _context7.abrupt("return", this.settings);

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getSettings() {
        return _getSettings.apply(this, arguments);
      }

      return getSettings;
    }()
  };
}

module.exports = {
  methods: methods
};