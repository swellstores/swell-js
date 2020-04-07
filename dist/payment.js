"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var cartApi = require('./cart');

var settingsApi = require('./settings');

var _require = require('./utils'),
    isFunction = _require.isFunction,
    vaultRequest = _require.vaultRequest;

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
      var _tokenize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var payMethods;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return settingsApi.methods(request).payments();

              case 2:
                payMethods = _context3.sent;

                if (!payMethods.error) {
                  _context3.next = 5;
                  break;
                }

                throw new Error(payMethods.error);

              case 5:
                _context3.next = 7;
                return paymentTokenize(request, this.params, payMethods);

              case 7:
                return _context3.abrupt("return", _context3.sent);

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function tokenize() {
        return _tokenize.apply(this, arguments);
      }

      return tokenize;
    }(),
    createIntent: function () {
      var _createIntent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(data) {
        var intent;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return vaultRequest('post', '/intent', data);

              case 2:
                intent = _context4.sent;

                if (!intent.error) {
                  _context4.next = 5;
                  break;
                }

                throw new Error(intent.error);

              case 5:
                return _context4.abrupt("return", intent);

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function createIntent(_x2) {
        return _createIntent.apply(this, arguments);
      }

      return createIntent;
    }(),
    updateIntent: function () {
      var _updateIntent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(data) {
        var intent;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return vaultRequest('put', '/intent', data);

              case 2:
                intent = _context5.sent;

                if (!intent.error) {
                  _context5.next = 5;
                  break;
                }

                throw new Error(intent.error);

              case 5:
                return _context5.abrupt("return", intent);

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function updateIntent(_x3) {
        return _updateIntent.apply(this, arguments);
      }

      return updateIntent;
    }()
  };
}

function render(_x4, _x5, _x6, _x7) {
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
            if (!params.paypal) {
              _context7.next = 34;
              break;
            }

            if (payMethods.paypal) {
              _context7.next = 22;
              break;
            }

            console.error("Payment element error: PayPal payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context7.next = 34;
            break;

          case 22:
            if (window.paypal) {
              _context7.next = 25;
              break;
            }

            _context7.next = 25;
            return loadScript('paypal-sdk', "https://www.paypal.com/sdk/js?client-id=".concat(payMethods.paypal.client_id, "&merchant-id=").concat(payMethods.paypal.merchant_id, "&vault=true"));

          case 25:
            if (!(payMethods.card && payMethods.card.gateway === 'braintree' && payMethods.paypal.gateway === 'braintree')) {
              _context7.next = 34;
              break;
            }

            if (window.braintree) {
              _context7.next = 29;
              break;
            }

            _context7.next = 29;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 29:
            if (!(window.braintree && !window.braintree.paypalCheckout)) {
              _context7.next = 32;
              break;
            }

            _context7.next = 32;
            return loadScript('braintree-web-paypal-checkout', 'https://js.braintreegateway.com/web/3.57.0/js/paypal-checkout.min.js');

          case 32:
            _context7.next = 34;
            return braintreePayPalButton(request, cart, payMethods, params);

          case 34:
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

  return function loadScript(_x8, _x9) {
    return _ref.apply(this, arguments);
  };
}();

function stripeElements(_x10, _x11, _x12) {
  return _stripeElements.apply(this, arguments);
}

function _stripeElements() {
  _stripeElements = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(request, payMethods, params) {
    var publicKey, stripe, elements, createElement;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            publicKey = payMethods.card.public_key;
            stripe = window.Stripe(publicKey);
            elements = stripe.elements();

            createElement = function createElement(type) {
              var elementParams = params.card[type] || {};
              var elementOptions = elementParams.options || {};
              var element = elements.create(type, elementOptions);
              element.mount(elementParams.elementId || "#".concat(type, "-element"));

              if (type === 'card' || type === 'cardNumber') {
                CARD_ELEMENTS.stripe = element;
              }
            };

            API.stripe = stripe;

            if (params.card.separateElements) {
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

function braintreePayPalButton(_x13, _x14, _x15, _x16) {
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

function paymentTokenize(_x17, _x18, _x19) {
  return _paymentTokenize.apply(this, arguments);
}

function _paymentTokenize() {
  _paymentTokenize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(request, params, payMethods) {
    var onError, stripe, stripeToken;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            onError = function onError(error) {
              if (isFunction(params.card.onError)) {
                return params.card.onError(error);
              }

              throw new Error(error.message);
            };

            if (params) {
              _context10.next = 3;
              break;
            }

            return _context10.abrupt("return");

          case 3:
            if (!(params.card && payMethods.card)) {
              _context10.next = 12;
              break;
            }

            if (!(payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe)) {
              _context10.next = 12;
              break;
            }

            stripe = API.stripe;
            _context10.next = 8;
            return stripe.createToken(CARD_ELEMENTS.stripe).then(function (_ref3) {
              var token = _ref3.token;
              return token;
            })["catch"](function (error) {
              return onError(error);
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