"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var get = require('lodash/get');

var toLower = require('lodash/toLower');

var cartApi = require('./cart');

var settingsApi = require('./settings');

var _require = require('./utils'),
    isFunction = _require.isFunction,
    vaultRequest = _require.vaultRequest,
    toSnake = _require.toSnake,
    getLocationParams = _require.getLocationParams,
    removeUrlParams = _require.removeUrlParams;

var _require2 = require('./utils/stripe'),
    createPaymentMethod = _require2.createPaymentMethod,
    createIDealPaymentMethod = _require2.createIDealPaymentMethod,
    createKlarnaSource = _require2.createKlarnaSource,
    createBancontactSource = _require2.createBancontactSource,
    stripeAmountByCurrency = _require2.stripeAmountByCurrency;

var _require3 = require('./utils/quickpay'),
    createQuickpayPayment = _require3.createQuickpayPayment,
    createQuickpayCard = _require3.createQuickpayCard,
    getQuickpayCardDetais = _require3.getQuickpayCardDetais;

var _require4 = require('./utils/paysafecard'),
    createPaysafecardPayment = _require4.createPaysafecardPayment;

var _require5 = require('./utils/klarna'),
    createKlarnaSession = _require5.createKlarnaSession;

var LOADING_SCRIPTS = {};
var CARD_ELEMENTS = {};
var API = {};
var options = null;

function methods(request, opts) {
  options = opts || options;
  return {
    params: null,
    methodSettings: null,
    get: function get(id) {
      return request('get', '/payments', id);
    },
    methods: function () {
      var _methods = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var result;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.methodSettings) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", this.methodSettings);

              case 2:
                _context.next = 4;
                return request('get', '/payment/methods');

              case 4:
                result = _context.sent;
                return _context.abrupt("return", this.methodSettings = result);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function methods() {
        return _methods.apply(this, arguments);
      }

      return methods;
    }(),
    createElements: function () {
      var _createElements = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(elementParams) {
        var cart, payMethods;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.params = elementParams || {};
                _context2.t0 = toSnake;
                _context2.next = 4;
                return cartApi.methods(request, options).get();

              case 4:
                _context2.t1 = _context2.sent;
                cart = (0, _context2.t0)(_context2.t1);

                if (cart) {
                  _context2.next = 8;
                  break;
                }

                throw new Error('Cart not found');

              case 8:
                _context2.t2 = toSnake;
                _context2.next = 11;
                return settingsApi.methods(request, options).payments();

              case 11:
                _context2.t3 = _context2.sent;
                payMethods = (0, _context2.t2)(_context2.t3);

                if (!payMethods.error) {
                  _context2.next = 15;
                  break;
                }

                throw new Error(payMethods.error);

              case 15:
                _context2.next = 17;
                return render(request, cart, payMethods, this.params);

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function createElements(_x) {
        return _createElements.apply(this, arguments);
      }

      return createElements;
    }(),
    tokenize: function () {
      var _tokenize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(params) {
        var cart, payMethods;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.t0 = toSnake;
                _context3.next = 3;
                return cartApi.methods(request, options).get();

              case 3:
                _context3.t1 = _context3.sent;
                cart = (0, _context3.t0)(_context3.t1);

                if (cart) {
                  _context3.next = 7;
                  break;
                }

                throw new Error('Cart not found');

              case 7:
                _context3.t2 = toSnake;
                _context3.next = 10;
                return settingsApi.methods(request, options).payments();

              case 10:
                _context3.t3 = _context3.sent;
                payMethods = (0, _context3.t2)(_context3.t3);

                if (!payMethods.error) {
                  _context3.next = 14;
                  break;
                }

                throw new Error(payMethods.error);

              case 14:
                _context3.next = 16;
                return paymentTokenize(request, params || this.params, payMethods, cart);

              case 16:
                return _context3.abrupt("return", _context3.sent);

              case 17:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function tokenize(_x2) {
        return _tokenize.apply(this, arguments);
      }

      return tokenize;
    }(),
    handleRedirect: function () {
      var _handleRedirect2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(params) {
        var cart;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.t0 = toSnake;
                _context4.next = 3;
                return cartApi.methods(request, options).get();

              case 3:
                _context4.t1 = _context4.sent;
                cart = (0, _context4.t0)(_context4.t1);

                if (cart) {
                  _context4.next = 7;
                  break;
                }

                throw new Error('Cart not found');

              case 7:
                _context4.next = 9;
                return _handleRedirect(request, params || this.params, cart);

              case 9:
                return _context4.abrupt("return", _context4.sent);

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function handleRedirect(_x3) {
        return _handleRedirect2.apply(this, arguments);
      }

      return handleRedirect;
    }(),
    authenticate: function () {
      var _authenticate2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(id) {
        var payment, payMethods;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.get(id);

              case 2:
                payment = _context5.sent;

                if (payment) {
                  _context5.next = 5;
                  break;
                }

                throw new Error('Payment not found');

              case 5:
                _context5.t0 = toSnake;
                _context5.next = 8;
                return settingsApi.methods(request, options).payments();

              case 8:
                _context5.t1 = _context5.sent;
                payMethods = (0, _context5.t0)(_context5.t1);

                if (!payMethods.error) {
                  _context5.next = 12;
                  break;
                }

                throw new Error(payMethods.error);

              case 12:
                _context5.next = 14;
                return _authenticate(request, payment, payMethods);

              case 14:
                return _context5.abrupt("return", _context5.sent);

              case 15:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function authenticate(_x4) {
        return _authenticate2.apply(this, arguments);
      }

      return authenticate;
    }(),
    createIntent: function () {
      var _createIntent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(data) {
        var intent, param, err;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return vaultRequest('post', '/intent', data);

              case 2:
                intent = _context6.sent;

                if (!intent.errors) {
                  _context6.next = 10;
                  break;
                }

                param = Object.keys(intent.errors)[0];
                err = new Error(intent.errors[param].message || 'Unknown error');
                err.code = 'vault_error';
                err.status = 402;
                err.param = param;
                throw err;

              case 10:
                return _context6.abrupt("return", intent);

              case 11:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function createIntent(_x5) {
        return _createIntent.apply(this, arguments);
      }

      return createIntent;
    }(),
    updateIntent: function () {
      var _updateIntent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(data) {
        var intent, param, err;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return vaultRequest('put', '/intent', data);

              case 2:
                intent = _context7.sent;

                if (!intent.errors) {
                  _context7.next = 10;
                  break;
                }

                param = Object.keys(intent.errors)[0];
                err = new Error(intent.errors[param].message || 'Unknown error');
                err.code = 'vault_error';
                err.status = 402;
                err.param = param;
                throw err;

              case 10:
                return _context7.abrupt("return", intent);

              case 11:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function updateIntent(_x6) {
        return _updateIntent.apply(this, arguments);
      }

      return updateIntent;
    }(),
    authorizeGateway: function () {
      var _authorizeGateway = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(data) {
        var authorization, param, err;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return vaultRequest('post', '/authorization', data);

              case 2:
                authorization = _context8.sent;

                if (!authorization.errors) {
                  _context8.next = 10;
                  break;
                }

                param = Object.keys(authorization.errors)[0];
                err = new Error(authorization.errors[param].message || 'Unknown error');
                err.code = 'vault_error';
                err.status = 402;
                err.param = param;
                throw err;

              case 10:
                return _context8.abrupt("return", authorization);

              case 11:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function authorizeGateway(_x7) {
        return _authorizeGateway.apply(this, arguments);
      }

      return authorizeGateway;
    }()
  };
}

function render(_x8, _x9, _x10, _x11) {
  return _render.apply(this, arguments);
}

function _render() {
  _render = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(request, cart, payMethods, params) {
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!params.card) {
              _context10.next = 17;
              break;
            }

            if (payMethods.card) {
              _context10.next = 5;
              break;
            }

            console.error("Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context10.next = 17;
            break;

          case 5:
            if (!(payMethods.card.gateway === 'braintree')) {
              _context10.next = 11;
              break;
            }

            if (window.braintree) {
              _context10.next = 9;
              break;
            }

            _context10.next = 9;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 9:
            _context10.next = 17;
            break;

          case 11:
            if (!(payMethods.card.gateway === 'stripe')) {
              _context10.next = 17;
              break;
            }

            if (window.Stripe) {
              _context10.next = 15;
              break;
            }

            _context10.next = 15;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 15:
            _context10.next = 17;
            return stripeElements(request, payMethods, params);

          case 17:
            if (!params.ideal) {
              _context10.next = 32;
              break;
            }

            if (payMethods.card) {
              _context10.next = 22;
              break;
            }

            console.error("Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context10.next = 32;
            break;

          case 22:
            if (payMethods.ideal) {
              _context10.next = 26;
              break;
            }

            console.error("Payment element error: iDEAL payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context10.next = 32;
            break;

          case 26:
            if (!(payMethods.card.gateway === 'stripe')) {
              _context10.next = 32;
              break;
            }

            if (window.Stripe) {
              _context10.next = 30;
              break;
            }

            _context10.next = 30;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 30:
            _context10.next = 32;
            return stripeElements(request, payMethods, params);

          case 32:
            if (!params.paypal) {
              _context10.next = 56;
              break;
            }

            if (payMethods.paypal) {
              _context10.next = 37;
              break;
            }

            console.error("Payment element error: PayPal payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context10.next = 56;
            break;

          case 37:
            if (!(payMethods.card && payMethods.card.gateway === 'braintree' && payMethods.paypal.gateway === 'braintree')) {
              _context10.next = 51;
              break;
            }

            if (window.paypal) {
              _context10.next = 41;
              break;
            }

            _context10.next = 41;
            return loadScript('paypal-sdk', "https://www.paypal.com/sdk/js?currency=".concat(cart.currency, "&client-id=").concat(payMethods.paypal.client_id, "&merchant-id=").concat(payMethods.paypal.merchant_id, "&vault=true"));

          case 41:
            if (window.braintree) {
              _context10.next = 44;
              break;
            }

            _context10.next = 44;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 44:
            if (!(window.braintree && !window.braintree.paypalCheckout)) {
              _context10.next = 47;
              break;
            }

            _context10.next = 47;
            return loadScript('braintree-web-paypal-checkout', 'https://js.braintreegateway.com/web/3.57.0/js/paypal-checkout.min.js');

          case 47:
            _context10.next = 49;
            return braintreePayPalButton(request, cart, payMethods, params);

          case 49:
            _context10.next = 56;
            break;

          case 51:
            if (window.paypal) {
              _context10.next = 54;
              break;
            }

            _context10.next = 54;
            return loadScript('paypal-sdk', "https://www.paypal.com/sdk/js?currency=".concat(cart.currency, "&client-id=").concat(payMethods.paypal.client_id, "&merchant-id=").concat(payMethods.paypal.merchant_id, "&intent=authorize&commit=false"));

          case 54:
            _context10.next = 56;
            return payPalButton(request, cart, payMethods, params);

          case 56:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _render.apply(this, arguments);
}

var loadScript = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(id, src) {
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            LOADING_SCRIPTS[id] = LOADING_SCRIPTS[id] || new Promise(function (resolve) {
              var script = document.createElement('script');
              script.id = id;
              script.src = src;
              script.async = true;
              script.type = 'text/javascript';
              script.addEventListener('load', function () {
                resolve();
                LOADING_SCRIPTS[id] = null;
              }, {
                once: true
              });
              document.head.appendChild(script);
            });
            return _context9.abrupt("return", LOADING_SCRIPTS[id]);

          case 2:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function loadScript(_x12, _x13) {
    return _ref.apply(this, arguments);
  };
}();

function stripeElements(_x14, _x15, _x16) {
  return _stripeElements.apply(this, arguments);
}

function _stripeElements() {
  _stripeElements = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(request, payMethods, params) {
    var publishable_key, stripe, elements, createElement;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            publishable_key = payMethods.card.publishable_key;
            stripe = window.Stripe(publishable_key);
            elements = stripe.elements(params.config);

            createElement = function createElement(type) {
              var elementParams = get(params, "card[".concat(type, "]")) || params.card || params.ideal;
              var elementOptions = elementParams.options || {};
              var element = elements.create(type, elementOptions);
              element.mount(elementParams.elementId || "#".concat(type, "-element"));
              elementParams.onChange && element.on('change', elementParams.onChange);
              elementParams.onReady && element.on('ready', elementParams.onReady);
              elementParams.onFocus && element.on('focus', elementParams.onFocus);
              elementParams.onBlur && element.on('blur', elementParams.onBlur);
              elementParams.onEscape && element.on('escape', elementParams.onEscape);
              elementParams.onClick && element.on('click', elementParams.onClick);

              if (type === 'card' || type === 'cardNumber' || type === 'idealBank') {
                CARD_ELEMENTS.stripe = element;
              }
            };

            API.stripe = stripe;

            if (params.ideal) {
              createElement('idealBank');
            } else if (params.card.separateElements) {
              createElement('cardNumber');
              createElement('cardExpiry');
              createElement('cardCvc');
            } else {
              createElement('card');
            }

          case 6:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _stripeElements.apply(this, arguments);
}

function payPalButton(_x17, _x18, _x19, _x20) {
  return _payPalButton.apply(this, arguments);
}

function _payPalButton() {
  _payPalButton = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(request, cart, payMethods, params) {
    var paypal, _params$paypal, locale, style, elementId, onError, onSuccess, _getTotalsDueRemainin, totalDue;

    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            paypal = window.paypal;
            _params$paypal = params.paypal;
            _params$paypal = _params$paypal === void 0 ? {} : _params$paypal;
            locale = _params$paypal.locale, style = _params$paypal.style, elementId = _params$paypal.elementId;

            onError = function onError(error) {
              var errorHandler = get(params, 'paypal.onError');

              if (isFunction(errorHandler)) {
                return errorHandler(error);
              }

              throw new Error(error.message);
            };

            onSuccess = function onSuccess() {
              var successHandler = get(params, 'paypal.onSuccess');
              return isFunction(successHandler) && successHandler();
            };

            _getTotalsDueRemainin = getTotalsDueRemaining(cart), totalDue = _getTotalsDueRemainin.totalDue;

            if (totalDue > 0) {
              _context12.next = 9;
              break;
            }

            throw new Error('Invalid PayPal button amount. Value should be greater than zero.');

          case 9:
            paypal.Buttons({
              locale: locale || 'en_US',
              style: style || {
                layout: 'horizontal',
                height: 45,
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                tagline: false
              },
              createOrder: function createOrder(data, actions) {
                return actions.order.create({
                  intent: 'AUTHORIZE',
                  purchase_units: [{
                    amount: {
                      value: +totalDue.toFixed(2),
                      currency_code: cart.currency
                    }
                  }]
                });
              },
              onApprove: function onApprove(data, actions) {
                return actions.order.get().then(function (order) {
                  var orderId = order.id;
                  var payer = order.payer;
                  var shipping = get(order, 'purchase_units[0].shipping');
                  return cartApi.methods(request).update(_objectSpread(_objectSpread({}, !cart.account_logged_in && {
                    account: {
                      email: payer.email_address
                    }
                  }), {}, {
                    billing: {
                      method: 'paypal',
                      paypal: {
                        order_id: orderId
                      }
                    },
                    shipping: {
                      name: shipping.name.full_name,
                      address1: shipping.address.address_line_1,
                      address2: shipping.address.address_line_2,
                      state: shipping.address.admin_area_1,
                      city: shipping.address.admin_area_2,
                      zip: shipping.address.postal_code,
                      country: shipping.address.country_code
                    }
                  }));
                }).then(onSuccess)["catch"](onError);
              }
            }, onError).render(elementId || '#paypal-button');

          case 10:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _payPalButton.apply(this, arguments);
}

function braintreePayPalButton(_x21, _x22, _x23, _x24) {
  return _braintreePayPalButton.apply(this, arguments);
}

function _braintreePayPalButton() {
  _braintreePayPalButton = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(request, cart, payMethods, params) {
    var authorization, braintree, paypal;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _context13.next = 2;
            return vaultRequest('post', '/authorization', {
              gateway: 'braintree'
            });

          case 2:
            authorization = _context13.sent;

            if (!authorization.error) {
              _context13.next = 5;
              break;
            }

            throw new Error(authorization.error);

          case 5:
            braintree = window.braintree;
            paypal = window.paypal;
            braintree.client.create({
              authorization: authorization
            }).then(function (client) {
              return braintree.paypalCheckout.create({
                client: client
              });
            }).then(function (paypalCheckoutInstance) {
              return paypal.Buttons({
                style: params.paypal.style || {},
                createBillingAgreement: function createBillingAgreement() {
                  return paypalCheckoutInstance.createPayment({
                    flow: 'vault',
                    currency: cart.currency,
                    amount: cart.grand_total
                  });
                },
                onApprove: function onApprove(data, actions) {
                  return paypalCheckoutInstance.tokenizePayment(data).then(function (_ref2) {
                    var nonce = _ref2.nonce;
                    return cartApi.methods(request, options).update({
                      billing: {
                        paypal: {
                          nonce: nonce
                        }
                      }
                    });
                  }).then(function () {
                    return isFunction(params.paypal.onSuccess) && params.paypal.onSuccess(data, actions);
                  })["catch"](isFunction(params.paypal.onError) ? params.paypal.onError : function (err) {
                    return console.error('PayPal error', err);
                  });
                },
                onCancel: isFunction(params.paypal.onCancel) ? function () {
                  return params.paypal.onCancel();
                } : function () {
                  return console.log('PayPal payment cancelled');
                },
                onError: isFunction(params.paypal.onError) ? function (err) {
                  return params.paypal.onError(err);
                } : function (err) {
                  return console.error('PayPal error', err);
                }
              }).render(params.paypal.elementId || '#paypal-button');
            })["catch"](isFunction(params.paypal.onError) ? params.paypal.onError : function (err) {
              return console.error('PayPal error', err);
            });

          case 8:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));
  return _braintreePayPalButton.apply(this, arguments);
}

function paymentTokenize(_x25, _x26, _x27, _x28) {
  return _paymentTokenize.apply(this, arguments);
}

function _paymentTokenize() {
  _paymentTokenize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(request, params, payMethods, cart) {
    var _getTotalsDueRemainin2, totalDue, onError, onSuccess, stripe, paymentMethod, currency, amount, stripeCustomer, intent, _yield$stripe$confirm, paymentIntent, error, _intent, _yield$createIDealPay, _error, _paymentMethod, _currency, _amount, _intent2, session, publishable_key, _stripe, settings, _yield$createKlarnaSo, _error2, source, _publishable_key, _stripe2, _yield$createBanconta, _error3, _source, _intent3;

    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _getTotalsDueRemainin2 = getTotalsDueRemaining(cart), totalDue = _getTotalsDueRemainin2.totalDue;

            onError = function onError(error) {
              var errorHandler = get(params, 'card.onError') || get(params, 'ideal.onError') || get(params, 'klarna.onError') || get(params, 'bancontact.onError') || get(params, 'paysafecard.onError');

              if (isFunction(errorHandler)) {
                return errorHandler(error);
              }

              throw new Error(error.message);
            };

            onSuccess = function onSuccess(result) {
              var successHandler = get(params, 'card.onSuccess') || get(params, 'ideal.onSuccess');

              if (isFunction(successHandler)) {
                return successHandler(result);
              }
            };

            if (params) {
              _context14.next = 5;
              break;
            }

            return _context14.abrupt("return", onError({
              message: 'Tokenization parameters not passed'
            }));

          case 5:
            if (!(params.card && payMethods.card)) {
              _context14.next = 56;
              break;
            }

            if (!(payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe)) {
              _context14.next = 41;
              break;
            }

            stripe = API.stripe;
            _context14.next = 10;
            return createPaymentMethod(stripe, CARD_ELEMENTS.stripe, cart);

          case 10:
            paymentMethod = _context14.sent;

            if (!paymentMethod.error) {
              _context14.next = 15;
              break;
            }

            return _context14.abrupt("return", onError(paymentMethod.error));

          case 15:
            if (!(totalDue < 1)) {
              _context14.next = 17;
              break;
            }

            return _context14.abrupt("return", cartApi.methods(request, options).update({
              billing: {
                method: 'card',
                card: paymentMethod
              }
            }).then(onSuccess)["catch"](onError));

          case 17:
            currency = toLower(get(cart, 'currency', 'usd'));
            amount = stripeAmountByCurrency(currency, cart.trial ? cart.trial_initial_capture_total + cart.trial_auth_total : totalDue);
            stripeCustomer = get(cart, 'account.stripe_customer');
            _context14.t0 = toSnake;
            _context14.next = 23;
            return methods(request).createIntent({
              gateway: 'stripe',
              intent: _objectSpread({
                payment_method: paymentMethod.token,
                amount: amount,
                currency: currency,
                capture_method: 'manual',
                setup_future_usage: 'off_session'
              }, stripeCustomer ? {
                customer: stripeCustomer
              } : {})
            })["catch"](onError);

          case 23:
            _context14.t1 = _context14.sent;
            intent = (0, _context14.t0)(_context14.t1);

            if (!(intent && intent.status === 'requires_confirmation')) {
              _context14.next = 39;
              break;
            }

            _context14.next = 28;
            return stripe.confirmCardPayment(intent.client_secret);

          case 28:
            _yield$stripe$confirm = _context14.sent;
            paymentIntent = _yield$stripe$confirm.paymentIntent;
            error = _yield$stripe$confirm.error;

            if (!error) {
              _context14.next = 35;
              break;
            }

            _context14.t2 = onError(error);
            _context14.next = 38;
            break;

          case 35:
            _context14.next = 37;
            return cartApi.methods(request, options).update({
              billing: {
                method: 'card',
                card: paymentMethod,
                intent: {
                  stripe: _objectSpread({
                    id: paymentIntent.id
                  }, cart.trial && {
                    auth_amount: cart.trial_auth_total
                  })
                }
              }
            }).then(onSuccess)["catch"](onError);

          case 37:
            _context14.t2 = _context14.sent;

          case 38:
            return _context14.abrupt("return", _context14.t2);

          case 39:
            _context14.next = 54;
            break;

          case 41:
            if (!(payMethods.card.gateway === 'quickpay')) {
              _context14.next = 54;
              break;
            }

            _context14.next = 44;
            return createQuickpayPayment(cart, methods(request).createIntent)["catch"](onError);

          case 44:
            _intent = _context14.sent;

            if (_intent) {
              _context14.next = 49;
              break;
            }

            return _context14.abrupt("return");

          case 49:
            if (!_intent.error) {
              _context14.next = 51;
              break;
            }

            return _context14.abrupt("return", onError(_intent.error));

          case 51:
            _context14.next = 53;
            return cartApi.methods(request, options).update({
              billing: {
                method: 'card',
                intent: {
                  quickpay: {
                    id: _intent
                  }
                }
              }
            });

          case 53:
            createQuickpayCard(methods(request).authorizeGateway)["catch"](onError);

          case 54:
            _context14.next = 134;
            break;

          case 56:
            if (!(params.ideal && payMethods.ideal)) {
              _context14.next = 83;
              break;
            }

            if (!(payMethods.card && payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe)) {
              _context14.next = 81;
              break;
            }

            _context14.next = 60;
            return createIDealPaymentMethod(API.stripe, CARD_ELEMENTS.stripe, cart.billing);

          case 60:
            _yield$createIDealPay = _context14.sent;
            _error = _yield$createIDealPay.error;
            _paymentMethod = _yield$createIDealPay.paymentMethod;

            if (!_error) {
              _context14.next = 65;
              break;
            }

            return _context14.abrupt("return", onError(_error));

          case 65:
            _currency = toLower(get(cart, 'currency', 'eur'));
            _amount = stripeAmountByCurrency(_currency, totalDue);
            _context14.t3 = toSnake;
            _context14.next = 70;
            return methods(request).createIntent({
              gateway: 'stripe',
              intent: {
                payment_method: _paymentMethod.id,
                amount: _amount,
                currency: _currency,
                payment_method_types: 'ideal',
                confirmation_method: 'manual',
                confirm: true,
                return_url: window.location.href
              }
            })["catch"](onError);

          case 70:
            _context14.t4 = _context14.sent;
            _intent2 = (0, _context14.t3)(_context14.t4);

            if (!_intent2) {
              _context14.next = 81;
              break;
            }

            _context14.next = 75;
            return cartApi.methods(request, options).update({
              billing: {
                method: 'ideal',
                ideal: {
                  token: _paymentMethod.id
                },
                intent: {
                  stripe: {
                    id: _intent2.id
                  }
                }
              }
            })["catch"](onError);

          case 75:
            _context14.t5 = _intent2.status === 'requires_action' || _intent2.status === 'requires_source_action';

            if (!_context14.t5) {
              _context14.next = 80;
              break;
            }

            _context14.next = 79;
            return API.stripe.handleCardAction(_intent2.client_secret);

          case 79:
            _context14.t5 = _context14.sent;

          case 80:
            return _context14.abrupt("return", _context14.t5);

          case 81:
            _context14.next = 134;
            break;

          case 83:
            if (!(params.klarna && payMethods.klarna)) {
              _context14.next = 110;
              break;
            }

            if (!(payMethods.klarna.gateway === 'klarna')) {
              _context14.next = 91;
              break;
            }

            _context14.next = 87;
            return createKlarnaSession(cart, methods(request).createIntent)["catch"](onError);

          case 87:
            session = _context14.sent;
            return _context14.abrupt("return", session && window.location.replace(session.redirect_url));

          case 91:
            if (!(payMethods.card && payMethods.card.gateway === 'stripe')) {
              _context14.next = 108;
              break;
            }

            if (window.Stripe) {
              _context14.next = 95;
              break;
            }

            _context14.next = 95;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 95:
            publishable_key = payMethods.card.publishable_key;
            _stripe = window.Stripe(publishable_key);
            _context14.t6 = toSnake;
            _context14.next = 100;
            return settingsApi.methods(request, options).get();

          case 100:
            _context14.t7 = _context14.sent;
            settings = (0, _context14.t6)(_context14.t7);
            _context14.next = 104;
            return createKlarnaSource(_stripe, _objectSpread(_objectSpread({}, cart), {}, {
              settings: settings.store
            }));

          case 104:
            _yield$createKlarnaSo = _context14.sent;
            _error2 = _yield$createKlarnaSo.error;
            source = _yield$createKlarnaSo.source;
            return _context14.abrupt("return", _error2 ? onError(_error2) : cartApi.methods(request, options).update({
              billing: {
                method: 'klarna'
              }
            }).then(function () {
              return window.location.replace(source.redirect.url);
            })["catch"](onError));

          case 108:
            _context14.next = 134;
            break;

          case 110:
            if (!(params.bancontact && payMethods.bancontact)) {
              _context14.next = 125;
              break;
            }

            if (!(payMethods.card && payMethods.card.gateway === 'stripe')) {
              _context14.next = 123;
              break;
            }

            if (window.Stripe) {
              _context14.next = 115;
              break;
            }

            _context14.next = 115;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 115:
            _publishable_key = payMethods.card.publishable_key;
            _stripe2 = window.Stripe(_publishable_key);
            _context14.next = 119;
            return createBancontactSource(_stripe2, cart);

          case 119:
            _yield$createBanconta = _context14.sent;
            _error3 = _yield$createBanconta.error;
            _source = _yield$createBanconta.source;
            return _context14.abrupt("return", _error3 ? onError(_error3) : cartApi.methods(request, options).update({
              billing: {
                method: 'bancontact'
              }
            }).then(function () {
              return window.location.replace(_source.redirect.url);
            })["catch"](onError));

          case 123:
            _context14.next = 134;
            break;

          case 125:
            if (!(params.paysafecard && payMethods.paysafecard)) {
              _context14.next = 134;
              break;
            }

            _context14.next = 128;
            return createPaysafecardPayment(cart, methods(request).createIntent)["catch"](onError);

          case 128:
            _intent3 = _context14.sent;

            if (_intent3) {
              _context14.next = 131;
              break;
            }

            return _context14.abrupt("return");

          case 131:
            _context14.next = 133;
            return cartApi.methods(request, options).update({
              billing: {
                method: 'paysafecard',
                intent: {
                  paysafecard: {
                    id: _intent3.id
                  }
                }
              }
            });

          case 133:
            return _context14.abrupt("return", window.location.replace(_intent3.redirect.auth_url));

          case 134:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));
  return _paymentTokenize.apply(this, arguments);
}

function _handleRedirect(_x29, _x30, _x31) {
  return _handleRedirect3.apply(this, arguments);
}

function _handleRedirect3() {
  _handleRedirect3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee15(request, params, cart) {
    var onError, onSuccess, queryParams, gateway, result;
    return _regenerator["default"].wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            onError = function onError(error) {
              var errorHandler = get(params, 'card.onError') || get(params, 'paysafecard.onError') || get(params, 'klarna.onError');

              if (isFunction(errorHandler)) {
                return errorHandler(error);
              }

              throw new Error(error.message);
            };

            onSuccess = function onSuccess(result) {
              var successHandler = get(params, 'card.onSuccess') || get(params, 'paysafecard.onSuccess') || get(params, 'klarna.onSuccess');

              if (isFunction(successHandler)) {
                return successHandler(result);
              }
            };

            queryParams = getLocationParams(window.location);
            removeUrlParams();
            gateway = queryParams.gateway;

            if (!(gateway === 'quickpay')) {
              _context15.next = 11;
              break;
            }

            _context15.next = 8;
            return handleQuickpayRedirectAction(request, cart, params, queryParams);

          case 8:
            result = _context15.sent;
            _context15.next = 21;
            break;

          case 11:
            if (!(gateway === 'paysafecard')) {
              _context15.next = 17;
              break;
            }

            _context15.next = 14;
            return handlePaysafecardRedirectAction(request, cart, params, queryParams);

          case 14:
            result = _context15.sent;
            _context15.next = 21;
            break;

          case 17:
            if (!(gateway === 'klarna_direct')) {
              _context15.next = 21;
              break;
            }

            _context15.next = 20;
            return handleDirectKlarnaRedirectAction(request, cart, params, queryParams);

          case 20:
            result = _context15.sent;

          case 21:
            if (result) {
              _context15.next = 25;
              break;
            }

            return _context15.abrupt("return");

          case 25:
            if (!result.error) {
              _context15.next = 29;
              break;
            }

            return _context15.abrupt("return", onError(result.error));

          case 29:
            return _context15.abrupt("return", onSuccess(result));

          case 30:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));
  return _handleRedirect3.apply(this, arguments);
}

function handleQuickpayRedirectAction(_x32, _x33, _x34, _x35) {
  return _handleQuickpayRedirectAction.apply(this, arguments);
}

function _handleQuickpayRedirectAction() {
  _handleQuickpayRedirectAction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee16(request, cart, params, queryParams) {
    var status, id, card;
    return _regenerator["default"].wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            status = queryParams.redirect_status, id = queryParams.card_id;
            _context16.t0 = status;
            _context16.next = _context16.t0 === 'succeeded' ? 4 : _context16.t0 === 'canceled' ? 18 : 19;
            break;

          case 4:
            _context16.next = 6;
            return getQuickpayCardDetais(id, methods(request).authorizeGateway);

          case 6:
            card = _context16.sent;

            if (card) {
              _context16.next = 11;
              break;
            }

            return _context16.abrupt("return");

          case 11:
            if (!card.error) {
              _context16.next = 15;
              break;
            }

            return _context16.abrupt("return", card);

          case 15:
            _context16.next = 17;
            return cartApi.methods(request, options).update({
              billing: {
                method: 'card',
                card: card
              }
            });

          case 17:
            return _context16.abrupt("return", {
              success: true
            });

          case 18:
            return _context16.abrupt("return", {
              error: {
                message: 'We are unable to authenticate your payment method. Please choose a different payment method and try again.'
              }
            });

          case 19:
            return _context16.abrupt("return", {
              error: {
                message: "Unknown redirect status: ".concat(status, ".")
              }
            });

          case 20:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16);
  }));
  return _handleQuickpayRedirectAction.apply(this, arguments);
}

function handlePaysafecardRedirectAction(_x36, _x37) {
  return _handlePaysafecardRedirectAction.apply(this, arguments);
}

function _handlePaysafecardRedirectAction() {
  _handlePaysafecardRedirectAction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee17(request, cart) {
    var paymentId, intent;
    return _regenerator["default"].wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            paymentId = get(cart, 'billing.intent.paysafecard.id');

            if (paymentId) {
              _context17.next = 3;
              break;
            }

            return _context17.abrupt("return", {
              error: {
                message: 'Paysafecard payment ID not defined.'
              }
            });

          case 3:
            _context17.next = 5;
            return methods(request).updateIntent({
              gateway: 'paysafecard',
              intent: {
                payment_id: paymentId
              }
            });

          case 5:
            intent = _context17.sent;

            if (intent) {
              _context17.next = 8;
              break;
            }

            return _context17.abrupt("return");

          case 8:
            _context17.t0 = intent.status;
            _context17.next = _context17.t0 === 'AUTHORIZED' ? 11 : _context17.t0 === 'CANCELED_CUSTOMER' ? 12 : 13;
            break;

          case 11:
            return _context17.abrupt("return", {
              success: true
            });

          case 12:
            return _context17.abrupt("return", {
              error: {
                message: 'We are unable to authenticate your payment method. Please choose a different payment method and try again.'
              }
            });

          case 13:
            return _context17.abrupt("return", {
              error: {
                message: "Unknown redirect status: ".concat(intent.status, ".")
              }
            });

          case 14:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17);
  }));
  return _handlePaysafecardRedirectAction.apply(this, arguments);
}

function handleDirectKlarnaRedirectAction(_x38, _x39, _x40, _x41) {
  return _handleDirectKlarnaRedirectAction.apply(this, arguments);
}

function _handleDirectKlarnaRedirectAction() {
  _handleDirectKlarnaRedirectAction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee18(request, cart, params, queryParams) {
    var authorization_token;
    return _regenerator["default"].wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            authorization_token = queryParams.authorization_token;

            if (authorization_token) {
              _context18.next = 3;
              break;
            }

            return _context18.abrupt("return", {
              error: {
                message: 'We are unable to authenticate your payment method. Please choose a different payment method and try again.'
              }
            });

          case 3:
            _context18.next = 5;
            return cartApi.methods(request, options).update({
              billing: {
                method: 'klarna',
                klarna: {
                  token: authorization_token
                }
              }
            });

          case 5:
            return _context18.abrupt("return", {
              success: true
            });

          case 6:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18);
  }));
  return _handleDirectKlarnaRedirectAction.apply(this, arguments);
}

function _authenticate(_x42, _x43, _x44) {
  return _authenticate3.apply(this, arguments);
}

function _authenticate3() {
  _authenticate3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee19(request, payment, payMethods) {
    var method, gateway, cardMethod;
    return _regenerator["default"].wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            method = payment.method, gateway = payment.gateway;

            if (!(method === 'card')) {
              _context19.next = 12;
              break;
            }

            cardMethod = payMethods.card;

            if (cardMethod) {
              _context19.next = 7;
              break;
            }

            console.error("Authenticate error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context19.next = 12;
            break;

          case 7:
            if (!(gateway === 'stripe' && cardMethod.gateway === 'stripe')) {
              _context19.next = 12;
              break;
            }

            if (window.Stripe) {
              _context19.next = 11;
              break;
            }

            _context19.next = 11;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 11:
            return _context19.abrupt("return", authenticateStripeCard(request, payment, payMethods));

          case 12:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19);
  }));
  return _authenticate3.apply(this, arguments);
}

function authenticateStripeCard(_x45, _x46, _x47) {
  return _authenticateStripeCard.apply(this, arguments);
}

function _authenticateStripeCard() {
  _authenticateStripeCard = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee20(request, payment, payMethods) {
    var id, _payment$card, token, publishable_key, intent, stripe, actionResult;

    return _regenerator["default"].wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            id = payment.transaction_id, _payment$card = payment.card;
            _payment$card = _payment$card === void 0 ? {} : _payment$card;
            token = _payment$card.token;
            publishable_key = payMethods.card.publishable_key;
            _context20.next = 6;
            return methods(request, options).updateIntent({
              gateway: 'stripe',
              intent: {
                id: id,
                payment_method: token
              }
            })["catch"](function (error) {
              return {
                error: error
              };
            });

          case 6:
            intent = _context20.sent;

            if (!intent.error) {
              _context20.next = 9;
              break;
            }

            return _context20.abrupt("return", intent);

          case 9:
            stripe = window.Stripe(publishable_key);
            _context20.next = 12;
            return stripe.confirmCardPayment(intent.client_secret);

          case 12:
            actionResult = _context20.sent;
            return _context20.abrupt("return", actionResult.error ? {
              error: {
                message: actionResult.error.message,
                code: actionResult.error.code
              }
            } : {
              status: actionResult.status
            });

          case 14:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20);
  }));
  return _authenticateStripeCard.apply(this, arguments);
}

function getTotalsDueRemaining(cart) {
  var grand_total = cart.grand_total,
      account = cart.account,
      account_credit_amount = cart.account_credit_amount,
      giftcards = cart.giftcards;
  var totalDue = grand_total;
  var totalRemaining = 0;
  var totalRemainingGiftcard = 0;
  var totalRemainingAccount = 0;

  if (giftcards && giftcards.length > 0) {
    var _iterator = _createForOfIteratorHelper(giftcards),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var gc = _step.value;
        totalDue -= gc.amount;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    if (totalDue < 0) {
      totalRemainingGiftcard = -totalDue;
    }
  }

  var accountCreditAmount = typeof account_credit_amount === 'number' ? account_credit_amount : account && account.balance;

  if (accountCreditAmount > 0) {
    totalDue -= accountCreditAmount;

    if (totalDue < 0) {
      totalRemainingAccount = -totalDue - totalRemainingGiftcard;
    }
  }

  if (totalDue < 0) {
    totalRemaining = -totalDue;
    totalDue = 0;
  }

  return {
    totalDue: totalDue,
    totalRemaining: totalRemaining,
    totalRemainingGiftcard: totalRemainingGiftcard,
    totalRemainingAccount: totalRemainingAccount
  };
}

module.exports = {
  methods: methods
};