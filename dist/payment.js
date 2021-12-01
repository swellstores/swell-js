"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

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

var LOADING_SCRIPTS = {};
var CARD_ELEMENTS = {};
var API = {};
var options = null;

function methods(request, opts) {
  options = opts || options;
  return {
    params: null,
    methodSettings: null,
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
    createIntent: function () {
      var _createIntent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(data) {
        var intent, param, err;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return vaultRequest('post', '/intent', data);

              case 2:
                intent = _context5.sent;

                if (!intent.errors) {
                  _context5.next = 10;
                  break;
                }

                param = Object.keys(intent.errors)[0];
                err = new Error(intent.errors[param].message || 'Unknown error');
                err.code = 'vault_error';
                err.status = 402;
                err.param = param;
                throw err;

              case 10:
                return _context5.abrupt("return", intent);

              case 11:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function createIntent(_x4) {
        return _createIntent.apply(this, arguments);
      }

      return createIntent;
    }(),
    updateIntent: function () {
      var _updateIntent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(data) {
        var intent, param, err;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return vaultRequest('put', '/intent', data);

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

      function updateIntent(_x5) {
        return _updateIntent.apply(this, arguments);
      }

      return updateIntent;
    }(),
    authorizeGateway: function () {
      var _authorizeGateway = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(data) {
        var authorization, param, err;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return vaultRequest('post', '/authorization', data);

              case 2:
                authorization = _context7.sent;

                if (!authorization.errors) {
                  _context7.next = 10;
                  break;
                }

                param = Object.keys(authorization.errors)[0];
                err = new Error(authorization.errors[param].message || 'Unknown error');
                err.code = 'vault_error';
                err.status = 402;
                err.param = param;
                throw err;

              case 10:
                return _context7.abrupt("return", authorization);

              case 11:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function authorizeGateway(_x6) {
        return _authorizeGateway.apply(this, arguments);
      }

      return authorizeGateway;
    }()
  };
}

function render(_x7, _x8, _x9, _x10) {
  return _render.apply(this, arguments);
}

function _render() {
  _render = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(request, cart, payMethods, params) {
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (!params.card) {
              _context9.next = 17;
              break;
            }

            if (payMethods.card) {
              _context9.next = 5;
              break;
            }

            console.error("Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context9.next = 17;
            break;

          case 5:
            if (!(payMethods.card.gateway === 'braintree')) {
              _context9.next = 11;
              break;
            }

            if (window.braintree) {
              _context9.next = 9;
              break;
            }

            _context9.next = 9;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 9:
            _context9.next = 17;
            break;

          case 11:
            if (!(payMethods.card.gateway === 'stripe')) {
              _context9.next = 17;
              break;
            }

            if (window.Stripe) {
              _context9.next = 15;
              break;
            }

            _context9.next = 15;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 15:
            _context9.next = 17;
            return stripeElements(request, payMethods, params);

          case 17:
            if (!params.ideal) {
              _context9.next = 32;
              break;
            }

            if (payMethods.card) {
              _context9.next = 22;
              break;
            }

            console.error("Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context9.next = 32;
            break;

          case 22:
            if (payMethods.ideal) {
              _context9.next = 26;
              break;
            }

            console.error("Payment element error: iDEAL payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context9.next = 32;
            break;

          case 26:
            if (!(payMethods.card.gateway === 'stripe')) {
              _context9.next = 32;
              break;
            }

            if (window.Stripe) {
              _context9.next = 30;
              break;
            }

            _context9.next = 30;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 30:
            _context9.next = 32;
            return stripeElements(request, payMethods, params);

          case 32:
            if (!params.paypal) {
              _context9.next = 56;
              break;
            }

            if (payMethods.paypal) {
              _context9.next = 37;
              break;
            }

            console.error("Payment element error: PayPal payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context9.next = 56;
            break;

          case 37:
            if (!(payMethods.card && payMethods.card.gateway === 'braintree' && payMethods.paypal.gateway === 'braintree')) {
              _context9.next = 51;
              break;
            }

            if (window.paypal) {
              _context9.next = 41;
              break;
            }

            _context9.next = 41;
            return loadScript('paypal-sdk', "https://www.paypal.com/sdk/js?currency=".concat(cart.currency, "&client-id=").concat(payMethods.paypal.client_id, "&merchant-id=").concat(payMethods.paypal.merchant_id, "&vault=true"));

          case 41:
            if (window.braintree) {
              _context9.next = 44;
              break;
            }

            _context9.next = 44;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 44:
            if (!(window.braintree && !window.braintree.paypalCheckout)) {
              _context9.next = 47;
              break;
            }

            _context9.next = 47;
            return loadScript('braintree-web-paypal-checkout', 'https://js.braintreegateway.com/web/3.57.0/js/paypal-checkout.min.js');

          case 47:
            _context9.next = 49;
            return braintreePayPalButton(request, cart, payMethods, params);

          case 49:
            _context9.next = 56;
            break;

          case 51:
            if (window.paypal) {
              _context9.next = 54;
              break;
            }

            _context9.next = 54;
            return loadScript('paypal-sdk', "https://www.paypal.com/sdk/js?currency=".concat(cart.currency, "&client-id=").concat(payMethods.paypal.client_id, "&merchant-id=").concat(payMethods.paypal.merchant_id, "&intent=authorize"));

          case 54:
            _context9.next = 56;
            return payPalButton(request, cart, payMethods, params);

          case 56:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _render.apply(this, arguments);
}

var loadScript = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(id, src) {
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
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
            return _context8.abrupt("return", LOADING_SCRIPTS[id]);

          case 2:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function loadScript(_x11, _x12) {
    return _ref.apply(this, arguments);
  };
}();

function stripeElements(_x13, _x14, _x15) {
  return _stripeElements.apply(this, arguments);
}

function _stripeElements() {
  _stripeElements = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(request, payMethods, params) {
    var publishable_key, stripe, elements, createElement;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            publishable_key = payMethods.card.publishable_key;
            stripe = window.Stripe(publishable_key);
            elements = stripe.elements();

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
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _stripeElements.apply(this, arguments);
}

function payPalButton(_x16, _x17, _x18, _x19) {
  return _payPalButton.apply(this, arguments);
}

function _payPalButton() {
  _payPalButton = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(request, cart, payMethods, params) {
    var paypal, _params$paypal, locale, style, elementId, onError, onSuccess, _getTotalsDueRemainin, totalDue;

    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
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
              _context11.next = 9;
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
                return actions.order.authorize().then(function (authorization) {
                  var payer = authorization.payer;
                  var shipping = get(authorization, 'purchase_units[0].shipping');
                  var authorizationID = get(authorization, 'purchase_units[0].payments.authorizations[0].id');
                  return cartApi.methods(request).update({
                    account: {
                      email: payer.email_address
                    },
                    billing: {
                      method: 'paypal',
                      paypal: {
                        authorization_id: authorizationID
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
                  });
                }).then(onSuccess)["catch"](onError);
              }
            }, onError).render(elementId || '#paypal-button');

          case 10:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _payPalButton.apply(this, arguments);
}

function braintreePayPalButton(_x20, _x21, _x22, _x23) {
  return _braintreePayPalButton.apply(this, arguments);
}

function _braintreePayPalButton() {
  _braintreePayPalButton = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(request, cart, payMethods, params) {
    var authorization, braintree, paypal;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return vaultRequest('post', '/authorization', {
              gateway: 'braintree'
            });

          case 2:
            authorization = _context12.sent;

            if (!authorization.error) {
              _context12.next = 5;
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
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _braintreePayPalButton.apply(this, arguments);
}

function paymentTokenize(_x24, _x25, _x26, _x27) {
  return _paymentTokenize.apply(this, arguments);
}

function _paymentTokenize() {
  _paymentTokenize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(request, params, payMethods, cart) {
    var onError, stripe, paymentMethod, currency, amount, stripeCustomer, intent, _yield$stripe$confirm, paymentIntent, error, _intent, _yield$createIDealPay, _error, _paymentMethod, _currency, _amount, _intent2, publishable_key, _stripe, settings, _yield$createKlarnaSo, _error2, source, _publishable_key, _stripe2, _yield$createBanconta, _error3, _source, _intent3;

    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            onError = function onError(error) {
              var errorHandler = get(params, 'card.onError') || get(params, 'ideal.onError') || get(params, 'klarna.onError') || get(params, 'bancontact.onError') || get(params, 'paysafecard.onError');

              if (isFunction(errorHandler)) {
                return errorHandler(error);
              }

              throw new Error(error.message);
            };

            if (params) {
              _context13.next = 3;
              break;
            }

            return _context13.abrupt("return", onError({
              message: 'Tokenization parameters not passed'
            }));

          case 3:
            if (!(params.card && payMethods.card)) {
              _context13.next = 50;
              break;
            }

            if (!(payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe)) {
              _context13.next = 35;
              break;
            }

            stripe = API.stripe;
            _context13.next = 8;
            return createPaymentMethod(stripe, CARD_ELEMENTS.stripe, cart);

          case 8:
            paymentMethod = _context13.sent;

            if (!paymentMethod.error) {
              _context13.next = 11;
              break;
            }

            return _context13.abrupt("return", onError(paymentMethod.error));

          case 11:
            currency = toLower(get(cart, 'currency', 'usd'));
            amount = stripeAmountByCurrency(currency, get(cart, 'grand_total', 0));
            stripeCustomer = get(cart, 'account.stripe_customer');
            _context13.t0 = toSnake;
            _context13.next = 17;
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
            })["catch"](function (err) {
              return onError(err);
            });

          case 17:
            _context13.t1 = _context13.sent;
            intent = (0, _context13.t0)(_context13.t1);

            if (!(intent && intent.status === 'requires_confirmation')) {
              _context13.next = 33;
              break;
            }

            _context13.next = 22;
            return stripe.confirmCardPayment(intent.client_secret);

          case 22:
            _yield$stripe$confirm = _context13.sent;
            paymentIntent = _yield$stripe$confirm.paymentIntent;
            error = _yield$stripe$confirm.error;

            if (!error) {
              _context13.next = 29;
              break;
            }

            _context13.t2 = onError(error);
            _context13.next = 32;
            break;

          case 29:
            _context13.next = 31;
            return cartApi.methods(request, options).update({
              billing: {
                method: 'card',
                card: paymentMethod,
                intent: {
                  stripe: {
                    id: paymentIntent.id
                  }
                }
              }
            }).then(function () {
              return isFunction(params.card.onSuccess) && params.card.onSuccess();
            })["catch"](function (err) {
              return onError(err);
            });

          case 31:
            _context13.t2 = _context13.sent;

          case 32:
            return _context13.abrupt("return", _context13.t2);

          case 33:
            _context13.next = 48;
            break;

          case 35:
            if (!(payMethods.card.gateway === 'quickpay')) {
              _context13.next = 48;
              break;
            }

            _context13.next = 38;
            return createQuickpayPayment(cart, methods(request).createIntent)["catch"](onError);

          case 38:
            _intent = _context13.sent;

            if (_intent) {
              _context13.next = 43;
              break;
            }

            return _context13.abrupt("return");

          case 43:
            if (!_intent.error) {
              _context13.next = 45;
              break;
            }

            return _context13.abrupt("return", onError(_intent.error));

          case 45:
            _context13.next = 47;
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

          case 47:
            createQuickpayCard(methods(request).authorizeGateway)["catch"](onError);

          case 48:
            _context13.next = 121;
            break;

          case 50:
            if (!(params.ideal && payMethods.ideal)) {
              _context13.next = 77;
              break;
            }

            if (!(payMethods.card && payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe)) {
              _context13.next = 75;
              break;
            }

            _context13.next = 54;
            return createIDealPaymentMethod(API.stripe, CARD_ELEMENTS.stripe, cart.billing);

          case 54:
            _yield$createIDealPay = _context13.sent;
            _error = _yield$createIDealPay.error;
            _paymentMethod = _yield$createIDealPay.paymentMethod;

            if (!_error) {
              _context13.next = 59;
              break;
            }

            return _context13.abrupt("return", onError(_error));

          case 59:
            _currency = toLower(get(cart, 'currency', 'eur'));
            _amount = stripeAmountByCurrency(_currency, get(cart, 'grand_total', 0));
            _context13.t3 = toSnake;
            _context13.next = 64;
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
            })["catch"](function (err) {
              return onError(err);
            });

          case 64:
            _context13.t4 = _context13.sent;
            _intent2 = (0, _context13.t3)(_context13.t4);

            if (!_intent2) {
              _context13.next = 75;
              break;
            }

            _context13.next = 69;
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
            })["catch"](function (err) {
              return onError(err);
            });

          case 69:
            _context13.t5 = _intent2.status === 'requires_action' || _intent2.status === 'requires_source_action';

            if (!_context13.t5) {
              _context13.next = 74;
              break;
            }

            _context13.next = 73;
            return API.stripe.handleCardAction(_intent2.client_secret);

          case 73:
            _context13.t5 = _context13.sent;

          case 74:
            return _context13.abrupt("return", _context13.t5);

          case 75:
            _context13.next = 121;
            break;

          case 77:
            if (!(params.klarna && payMethods.klarna)) {
              _context13.next = 97;
              break;
            }

            if (!(payMethods.card && payMethods.card.gateway === 'stripe')) {
              _context13.next = 95;
              break;
            }

            if (window.Stripe) {
              _context13.next = 82;
              break;
            }

            _context13.next = 82;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 82:
            publishable_key = payMethods.card.publishable_key;
            _stripe = window.Stripe(publishable_key);
            _context13.t6 = toSnake;
            _context13.next = 87;
            return settingsApi.methods(request, options).get();

          case 87:
            _context13.t7 = _context13.sent;
            settings = (0, _context13.t6)(_context13.t7);
            _context13.next = 91;
            return createKlarnaSource(_stripe, _objectSpread(_objectSpread({}, cart), {}, {
              settings: settings.store
            }));

          case 91:
            _yield$createKlarnaSo = _context13.sent;
            _error2 = _yield$createKlarnaSo.error;
            source = _yield$createKlarnaSo.source;
            return _context13.abrupt("return", _error2 ? onError(_error2) : cartApi.methods(request, options).update({
              billing: {
                method: 'klarna'
              }
            }).then(function () {
              return window.location.replace(source.redirect.url);
            })["catch"](function (err) {
              return onError(err);
            }));

          case 95:
            _context13.next = 121;
            break;

          case 97:
            if (!(params.bancontact && payMethods.bancontact)) {
              _context13.next = 112;
              break;
            }

            if (!(payMethods.card && payMethods.card.gateway === 'stripe')) {
              _context13.next = 110;
              break;
            }

            if (window.Stripe) {
              _context13.next = 102;
              break;
            }

            _context13.next = 102;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 102:
            _publishable_key = payMethods.card.publishable_key;
            _stripe2 = window.Stripe(_publishable_key);
            _context13.next = 106;
            return createBancontactSource(_stripe2, cart);

          case 106:
            _yield$createBanconta = _context13.sent;
            _error3 = _yield$createBanconta.error;
            _source = _yield$createBanconta.source;
            return _context13.abrupt("return", _error3 ? onError(_error3) : cartApi.methods(request, options).update({
              billing: {
                method: 'bancontact'
              }
            }).then(function () {
              return window.location.replace(_source.redirect.url);
            })["catch"](function (err) {
              return onError(err);
            }));

          case 110:
            _context13.next = 121;
            break;

          case 112:
            if (!(params.paysafecard && payMethods.paysafecard)) {
              _context13.next = 121;
              break;
            }

            _context13.next = 115;
            return createPaysafecardPayment(cart, methods(request).createIntent)["catch"](onError);

          case 115:
            _intent3 = _context13.sent;

            if (_intent3) {
              _context13.next = 118;
              break;
            }

            return _context13.abrupt("return");

          case 118:
            _context13.next = 120;
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

          case 120:
            return _context13.abrupt("return", window.location.replace(_intent3.redirect.auth_url));

          case 121:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));
  return _paymentTokenize.apply(this, arguments);
}

function _handleRedirect(_x28, _x29, _x30) {
  return _handleRedirect3.apply(this, arguments);
}

function _handleRedirect3() {
  _handleRedirect3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(request, params, cart) {
    var onError, onSuccess, queryParams, gateway, result;
    return _regenerator["default"].wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            onError = function onError(error) {
              var errorHandler = get(params, 'card.onError') || get(params, 'paysafecard.onError');

              if (isFunction(errorHandler)) {
                return errorHandler(error);
              }

              throw new Error(error.message);
            };

            onSuccess = function onSuccess(result) {
              var successHandler = get(params, 'card.onSuccess') || get(params, 'paysafecard.onSuccess');

              if (isFunction(successHandler)) {
                return successHandler(result);
              }

              console.log(result);
            };

            queryParams = getLocationParams(window.location);
            removeUrlParams();
            gateway = queryParams.gateway;

            if (!(gateway === 'quickpay')) {
              _context14.next = 11;
              break;
            }

            _context14.next = 8;
            return handleQuickpayRedirectAction(request, cart, params, queryParams);

          case 8:
            result = _context14.sent;
            _context14.next = 15;
            break;

          case 11:
            if (!(gateway === 'paysafecard')) {
              _context14.next = 15;
              break;
            }

            _context14.next = 14;
            return handlePaysafecardRedirectAction(request, cart, params, queryParams);

          case 14:
            result = _context14.sent;

          case 15:
            if (result) {
              _context14.next = 19;
              break;
            }

            return _context14.abrupt("return");

          case 19:
            if (!result.error) {
              _context14.next = 23;
              break;
            }

            return _context14.abrupt("return", onError(result.error));

          case 23:
            return _context14.abrupt("return", onSuccess(result));

          case 24:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));
  return _handleRedirect3.apply(this, arguments);
}

function handleQuickpayRedirectAction(_x31, _x32, _x33, _x34) {
  return _handleQuickpayRedirectAction.apply(this, arguments);
}

function _handleQuickpayRedirectAction() {
  _handleQuickpayRedirectAction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee15(request, cart, params, queryParams) {
    var status, id, card;
    return _regenerator["default"].wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            status = queryParams.redirect_status, id = queryParams.card_id;
            _context15.t0 = status;
            _context15.next = _context15.t0 === 'succeeded' ? 4 : _context15.t0 === 'canceled' ? 18 : 19;
            break;

          case 4:
            _context15.next = 6;
            return getQuickpayCardDetais(id, methods(request).authorizeGateway);

          case 6:
            card = _context15.sent;

            if (card) {
              _context15.next = 11;
              break;
            }

            return _context15.abrupt("return");

          case 11:
            if (!card.error) {
              _context15.next = 15;
              break;
            }

            return _context15.abrupt("return", card);

          case 15:
            _context15.next = 17;
            return cartApi.methods(request, options).update({
              billing: {
                method: 'card',
                card: card
              }
            });

          case 17:
            return _context15.abrupt("return", {
              success: true
            });

          case 18:
            return _context15.abrupt("return", {
              error: {
                message: 'We are unable to authenticate your payment method. Please choose a different payment method and try again.'
              }
            });

          case 19:
            return _context15.abrupt("return", {
              error: {
                message: "Unknown redirect status: ".concat(status, ".")
              }
            });

          case 20:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));
  return _handleQuickpayRedirectAction.apply(this, arguments);
}

function handlePaysafecardRedirectAction(_x35, _x36) {
  return _handlePaysafecardRedirectAction.apply(this, arguments);
}

function _handlePaysafecardRedirectAction() {
  _handlePaysafecardRedirectAction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee16(request, cart) {
    var paymentId, intent;
    return _regenerator["default"].wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            paymentId = get(cart, 'billing.intent.paysafecard.id');

            if (paymentId) {
              _context16.next = 3;
              break;
            }

            return _context16.abrupt("return", {
              error: {
                message: 'Paysafecard payment ID not defined.'
              }
            });

          case 3:
            _context16.next = 5;
            return methods(request).updateIntent({
              gateway: 'paysafecard',
              intent: {
                payment_id: paymentId
              }
            });

          case 5:
            intent = _context16.sent;

            if (intent) {
              _context16.next = 8;
              break;
            }

            return _context16.abrupt("return");

          case 8:
            _context16.t0 = intent.status;
            _context16.next = _context16.t0 === 'AUTHORIZED' ? 11 : _context16.t0 === 'CANCELED_CUSTOMER' ? 12 : 13;
            break;

          case 11:
            return _context16.abrupt("return", {
              success: true
            });

          case 12:
            return _context16.abrupt("return", {
              error: {
                message: 'We are unable to authenticate your payment method. Please choose a different payment method and try again.'
              }
            });

          case 13:
            return _context16.abrupt("return", {
              error: {
                message: "Unknown redirect status: ".concat(intent.status, ".")
              }
            });

          case 14:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16);
  }));
  return _handlePaysafecardRedirectAction.apply(this, arguments);
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