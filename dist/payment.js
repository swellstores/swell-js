"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var get = require('lodash/get');

var toLower = require('lodash/toLower');

var cartApi = require('./cart');

var settingsApi = require('./settings');

var _require = require('./utils'),
    isFunction = _require.isFunction,
    vaultRequest = _require.vaultRequest;

var _require2 = require('./utils/stripe'),
    createIDealPaymentMethod = _require2.createIDealPaymentMethod,
    createKlarnaSource = _require2.createKlarnaSource;

var LOADING_SCRIPTS = {};
var CARD_ELEMENTS = {};
var API = {};

function methods(request) {
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
                _context2.next = 3;
                return cartApi.methods(request).get();

              case 3:
                cart = _context2.sent;

                if (cart) {
                  _context2.next = 6;
                  break;
                }

                throw new Error('Cart not found');

              case 6:
                _context2.next = 8;
                return settingsApi.methods(request).payments();

              case 8:
                payMethods = _context2.sent;

                if (!payMethods.error) {
                  _context2.next = 11;
                  break;
                }

                throw new Error(payMethods.error);

              case 11:
                _context2.next = 13;
                return render(request, cart, payMethods, this.params);

              case 13:
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
                _context3.next = 2;
                return cartApi.methods(request).get();

              case 2:
                cart = _context3.sent;

                if (cart) {
                  _context3.next = 5;
                  break;
                }

                throw new Error('Cart not found');

              case 5:
                _context3.next = 7;
                return settingsApi.methods(request).payments();

              case 7:
                payMethods = _context3.sent;

                if (!payMethods.error) {
                  _context3.next = 10;
                  break;
                }

                throw new Error(payMethods.error);

              case 10:
                _context3.next = 12;
                return paymentTokenize(request, params || this.params, payMethods, cart);

              case 12:
                return _context3.abrupt("return", _context3.sent);

              case 13:
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
    createIntent: function () {
      var _createIntent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(data) {
        var intent, param, err;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return vaultRequest('post', '/intent', data);

              case 2:
                intent = _context4.sent;

                if (!intent.errors) {
                  _context4.next = 10;
                  break;
                }

                param = Object.keys(intent.errors)[0];
                err = new Error(intent.errors[param].message || 'Unknown error');
                err.code = 'vault_error';
                err.status = 402;
                err.param = param;
                throw err;

              case 10:
                return _context4.abrupt("return", intent);

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function createIntent(_x3) {
        return _createIntent.apply(this, arguments);
      }

      return createIntent;
    }(),
    updateIntent: function () {
      var _updateIntent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(data) {
        var intent, param, err;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return vaultRequest('put', '/intent', data);

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

      function updateIntent(_x4) {
        return _updateIntent.apply(this, arguments);
      }

      return updateIntent;
    }()
  };
}

function render(_x5, _x6, _x7, _x8) {
  return _render.apply(this, arguments);
}

function _render() {
  _render = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(request, cart, payMethods, params) {
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!params.card) {
              _context7.next = 17;
              break;
            }

            if (payMethods.card) {
              _context7.next = 5;
              break;
            }

            console.error("Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context7.next = 17;
            break;

          case 5:
            if (!(payMethods.card.gateway === 'braintree')) {
              _context7.next = 11;
              break;
            }

            if (window.braintree) {
              _context7.next = 9;
              break;
            }

            _context7.next = 9;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 9:
            _context7.next = 17;
            break;

          case 11:
            if (!(payMethods.card.gateway === 'stripe')) {
              _context7.next = 17;
              break;
            }

            if (window.Stripe) {
              _context7.next = 15;
              break;
            }

            _context7.next = 15;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 15:
            _context7.next = 17;
            return stripeElements(request, payMethods, params);

          case 17:
            if (!params.ideal) {
              _context7.next = 32;
              break;
            }

            if (payMethods.card) {
              _context7.next = 22;
              break;
            }

            console.error("Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context7.next = 32;
            break;

          case 22:
            if (payMethods.ideal) {
              _context7.next = 26;
              break;
            }

            console.error("Payment element error: iDEAL payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context7.next = 32;
            break;

          case 26:
            if (!(payMethods.card.gateway === 'stripe')) {
              _context7.next = 32;
              break;
            }

            if (window.Stripe) {
              _context7.next = 30;
              break;
            }

            _context7.next = 30;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 30:
            _context7.next = 32;
            return stripeElements(request, payMethods, params);

          case 32:
            if (!params.paypal) {
              _context7.next = 49;
              break;
            }

            if (payMethods.paypal) {
              _context7.next = 37;
              break;
            }

            console.error("Payment element error: PayPal payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context7.next = 49;
            break;

          case 37:
            if (window.paypal) {
              _context7.next = 40;
              break;
            }

            _context7.next = 40;
            return loadScript('paypal-sdk', "https://www.paypal.com/sdk/js?client-id=".concat(payMethods.paypal.client_id, "&merchant-id=").concat(payMethods.paypal.merchant_id, "&vault=true"));

          case 40:
            if (!(payMethods.card && payMethods.card.gateway === 'braintree' && payMethods.paypal.gateway === 'braintree')) {
              _context7.next = 49;
              break;
            }

            if (window.braintree) {
              _context7.next = 44;
              break;
            }

            _context7.next = 44;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 44:
            if (!(window.braintree && !window.braintree.paypalCheckout)) {
              _context7.next = 47;
              break;
            }

            _context7.next = 47;
            return loadScript('braintree-web-paypal-checkout', 'https://js.braintreegateway.com/web/3.57.0/js/paypal-checkout.min.js');

          case 47:
            _context7.next = 49;
            return braintreePayPalButton(request, cart, payMethods, params);

          case 49:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _render.apply(this, arguments);
}

var loadScript = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(id, src) {
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
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
            return _context6.abrupt("return", LOADING_SCRIPTS[id]);

          case 2:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function loadScript(_x9, _x10) {
    return _ref.apply(this, arguments);
  };
}();

function stripeElements(_x11, _x12, _x13) {
  return _stripeElements.apply(this, arguments);
}

function _stripeElements() {
  _stripeElements = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(request, payMethods, params) {
    var publishableKey, stripe, elements, createElement;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            publishableKey = payMethods.card.publishable_key;
            stripe = window.Stripe(publishableKey);
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
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _stripeElements.apply(this, arguments);
}

function braintreePayPalButton(_x14, _x15, _x16, _x17) {
  return _braintreePayPalButton.apply(this, arguments);
}

function _braintreePayPalButton() {
  _braintreePayPalButton = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(request, cart, payMethods, params) {
    var authorization, braintree, paypal;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return vaultRequest('post', '/authorization', {
              gateway: 'braintree'
            });

          case 2:
            authorization = _context9.sent;

            if (!authorization.error) {
              _context9.next = 5;
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
                    return cartApi.methods(request).update({
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
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _braintreePayPalButton.apply(this, arguments);
}

function paymentTokenize(_x18, _x19, _x20, _x21) {
  return _paymentTokenize.apply(this, arguments);
}

function _paymentTokenize() {
  _paymentTokenize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(request, params, payMethods, cart) {
    var onError, stripe, stripeToken, _ref4, error, paymentMethod, amount, currency, intent, publishableKey, _stripe, settings, _ref5, _error, source;

    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            onError = function onError(error) {
              var errorHandler = get(params, 'card.onError') || get(params, 'ideal.onError') || get(params, 'klarna.onError');

              if (isFunction(errorHandler)) {
                return errorHandler(error);
              }

              throw new Error(error.message);
            };

            if (params) {
              _context10.next = 3;
              break;
            }

            return _context10.abrupt("return", onError({
              message: 'Tokenization parameters not passed'
            }));

          case 3:
            if (!(params.card && payMethods.card)) {
              _context10.next = 14;
              break;
            }

            if (!(payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe)) {
              _context10.next = 12;
              break;
            }

            stripe = API.stripe;
            _context10.next = 8;
            return stripe.createToken(CARD_ELEMENTS.stripe).then(function (_ref3) {
              var error = _ref3.error,
                  token = _ref3.token;
              return error ? onError(error) : token;
            });

          case 8:
            stripeToken = _context10.sent;

            if (!stripeToken) {
              _context10.next = 12;
              break;
            }

            _context10.next = 12;
            return cartApi.methods(request).update({
              billing: {
                card: {
                  token: stripeToken.id,
                  last4: stripeToken.card.last4,
                  exp_month: stripeToken.card.exp_month,
                  exp_year: stripeToken.card.exp_year,
                  brand: stripeToken.card.brand,
                  address_check: stripeToken.card.address_line1_check,
                  cvc_check: stripeToken.card.cvc_check,
                  zip_check: stripeToken.card.address_zip_check
                }
              }
            }).then(function () {
              return isFunction(params.card.onSuccess) && params.card.onSuccess();
            })["catch"](function (err) {
              return onError(err);
            });

          case 12:
            _context10.next = 55;
            break;

          case 14:
            if (!(params.ideal && payMethods.ideal)) {
              _context10.next = 39;
              break;
            }

            if (!(payMethods.card && payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe)) {
              _context10.next = 37;
              break;
            }

            _context10.next = 18;
            return createIDealPaymentMethod(API.stripe, CARD_ELEMENTS.stripe, cart.billing);

          case 18:
            _ref4 = _context10.sent;
            error = _ref4.error;
            paymentMethod = _ref4.paymentMethod;

            if (!error) {
              _context10.next = 23;
              break;
            }

            return _context10.abrupt("return", onError(error));

          case 23:
            amount = get(cart, 'grand_total', 0) * 100;
            currency = toLower(get(cart, 'currency', 'eur'));
            _context10.next = 27;
            return methods(request).createIntent({
              gateway: 'stripe',
              intent: {
                payment_method: paymentMethod.id,
                amount: amount,
                currency: currency,
                payment_method_types: 'ideal',
                confirmation_method: 'manual',
                confirm: true,
                return_url: window.location.href
              }
            })["catch"](function (err) {
              return onError(err);
            });

          case 27:
            intent = _context10.sent;

            if (!intent) {
              _context10.next = 37;
              break;
            }

            _context10.next = 31;
            return cartApi.methods(request).update({
              billing: {
                method: 'ideal',
                ideal: {
                  token: paymentMethod.id
                },
                stripe_payment_intent: _objectSpread({}, intent, {
                  status: undefined
                })
              }
            })["catch"](function (err) {
              return onError(err);
            });

          case 31:
            _context10.t0 = intent.status === 'requires_action' || intent.status === 'requires_source_action';

            if (!_context10.t0) {
              _context10.next = 36;
              break;
            }

            _context10.next = 35;
            return API.stripe.handleCardAction(intent.client_secret);

          case 35:
            _context10.t0 = _context10.sent;

          case 36:
            return _context10.abrupt("return", _context10.t0);

          case 37:
            _context10.next = 55;
            break;

          case 39:
            if (!(params.klarna && payMethods.klarna)) {
              _context10.next = 55;
              break;
            }

            if (!(payMethods.card && payMethods.card.gateway === 'stripe')) {
              _context10.next = 55;
              break;
            }

            if (window.Stripe) {
              _context10.next = 44;
              break;
            }

            _context10.next = 44;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 44:
            publishableKey = payMethods.card.publishable_key;
            _stripe = window.Stripe(publishableKey);
            _context10.next = 48;
            return settingsApi.methods(request).get();

          case 48:
            settings = _context10.sent;
            _context10.next = 51;
            return createKlarnaSource(_stripe, _objectSpread({}, cart, {
              settings: settings.store
            }));

          case 51:
            _ref5 = _context10.sent;
            _error = _ref5.error;
            source = _ref5.source;
            return _context10.abrupt("return", _error ? onError(_error) : cartApi.methods(request).update({
              billing: {
                method: 'klarna'
              }
            }).then(function () {
              return window.location.replace(source.redirect.url);
            })["catch"](function (err) {
              return onError(err);
            }));

          case 55:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _paymentTokenize.apply(this, arguments);
}

module.exports = {
  methods: methods
};