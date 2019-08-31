"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./products'),
    cleanProductOptions = _require.cleanProductOptions;

function methods(request, options) {
  return {
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
    getItemData: function getItemData(item) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var result = item;

      if (typeof item === 'string') {
        result = (0, _objectSpread2["default"])({}, data || {}, {
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
    setItems: function setItems(items) {
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
    update: function update(data) {
      if (data.items && data.items.map) {
        data.items = data.items.map(this.getItemData);
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
  };
}

module.exports = {
  methods: methods
};