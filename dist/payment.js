"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var cartApi = require('./cart');

var cardApi = require('./card');

var settingsApi = require('./settings');

var _require = require('./utils'),
    isFunction = _require.isFunction,
    vaultRequest = _require.vaultRequest;

var LOADING_SCRIPTS = {};

function methods(request) {
  return {
    params: null,
    methodSettings: null,
    methods: function () {
      var _methods = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee() {
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
      var _createElements = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(elementParams) {
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
      var _tokenize = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee3() {
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
                return paymentTokenize(this.params, payMethods);

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
    }()
  };
}

function render(_x2, _x3, _x4, _x5) {
  return _render.apply(this, arguments);
}

function _render() {
  _render = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee5(request, cart, payMethods, params) {
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!params.card) {
              _context5.next = 17;
              break;
            }

            if (payMethods.card) {
              _context5.next = 5;
              break;
            }

            console.error("Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context5.next = 17;
            break;

          case 5:
            if (!(payMethods.card.gateway === 'braintree')) {
              _context5.next = 11;
              break;
            }

            if (window.braintree) {
              _context5.next = 9;
              break;
            }

            _context5.next = 9;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 9:
            _context5.next = 17;
            break;

          case 11:
            if (!(payMethods.card.gateway === 'stripe')) {
              _context5.next = 17;
              break;
            }

            if (window.Stripe) {
              _context5.next = 15;
              break;
            }

            _context5.next = 15;
            return loadScript('stripe-js', 'https://js.stripe.com/v3/');

          case 15:
            _context5.next = 17;
            return stripeElements(request, payMethods, params);

          case 17:
            if (!params.paypal) {
              _context5.next = 34;
              break;
            }

            if (payMethods.paypal) {
              _context5.next = 22;
              break;
            }

            console.error("Payment element error: PayPal payments are disabled. See Payment settings in the Swell dashboard for details.");
            _context5.next = 34;
            break;

          case 22:
            if (window.paypal) {
              _context5.next = 25;
              break;
            }

            _context5.next = 25;
            return loadScript('paypal-sdk', "https://www.paypal.com/sdk/js?client-id=".concat(payMethods.paypal.client_id, "&merchant-id=").concat(payMethods.paypal.merchant_id, "&vault=true"));

          case 25:
            if (!(payMethods.card && payMethods.card.gateway === 'braintree')) {
              _context5.next = 34;
              break;
            }

            if (window.braintree) {
              _context5.next = 29;
              break;
            }

            _context5.next = 29;
            return loadScript('braintree-web', 'https://js.braintreegateway.com/web/3.57.0/js/client.min.js');

          case 29:
            if (!(window.braintree && !window.braintree.paypalCheckout)) {
              _context5.next = 32;
              break;
            }

            _context5.next = 32;
            return loadScript('braintree-web-paypal-checkout', 'https://js.braintreegateway.com/web/3.57.0/js/paypal-checkout.min.js');

          case 32:
            _context5.next = 34;
            return braintreePayPalButton(request, cart, payMethods, params);

          case 34:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _render.apply(this, arguments);
}

var loadScript =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee4(id, src) {
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
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
            return _context4.abrupt("return", LOADING_SCRIPTS[id]);

          case 2:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function loadScript(_x6, _x7) {
    return _ref.apply(this, arguments);
  };
}();

function stripeElements(_x8, _x9, _x10) {
  return _stripeElements.apply(this, arguments);
}

function _stripeElements() {
  _stripeElements = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee6(request, payMethods, params) {
    var onError, publicKey, stripe, elements, card, createElement;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            onError = function onError(error) {
              if (isFunction(params.onError)) {
                return params.onError(error);
              }

              throw new Error(error.message);
            };

            publicKey = payMethods.card.public_key;
            stripe = window.Stripe(publicKey);
            elements = stripe.elements();
            card = null;

            createElement = function createElement(type) {
              var elementParams = params.card[type] || {};
              var elementOptions = elementParams.options || {};
              var element = elements.create(type, elementOptions);
              element.mount(elementParams.elementId || "#".concat(type, "-element"));

              if (type === 'card' || type === 'cardNumber') {
                card = element;
              }
            };

            if (params.card.separateElements) {
              createElement('cardNumber');
              createElement('cardExpiry');
              createElement('cardCvc');
            } else {
              createElement('card');
            }

          case 7:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _stripeElements.apply(this, arguments);
}

function braintreePayPalButton(_x11, _x12, _x13, _x14) {
  return _braintreePayPalButton.apply(this, arguments);
}

function _braintreePayPalButton() {
  _braintreePayPalButton = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee7(request, cart, payMethods, params) {
    var authorization, braintree, paypal;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return vaultRequest('post', '/authorization', {
              gateway: 'braintree'
            });

          case 2:
            authorization = _context7.sent;

            if (!authorization.error) {
              _context7.next = 5;
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
                    return isFunction(params.onSuccess) && params.onSuccess();
                  })["catch"](isFunction(params.onError) ? params.onError : function (err) {
                    return console.error('PayPal error', err);
                  });
                },
                onCancel: isFunction(params.onCancel) ? function () {
                  return params.onCancel();
                } : function () {
                  return console.log('PayPal payment cancelled');
                },
                onError: isFunction(params.onError) ? function (err) {
                  return params.onError(err);
                } : function (err) {
                  return console.error('PayPal error', err);
                }
              }).render(params.paypal.elementId || '#paypal-button');
            })["catch"](isFunction(params.onError) ? params.onError : function (err) {
              return console.error('PayPal error', err);
            });

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _braintreePayPalButton.apply(this, arguments);
}

function paymentTokenize(_x15, _x16) {
  return _paymentTokenize.apply(this, arguments);
}

function _paymentTokenize() {
  _paymentTokenize = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee9(params, payMethods) {
    var stripeToken, cardData;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (params) {
              _context9.next = 2;
              break;
            }

            return _context9.abrupt("return");

          case 2:
            if (!(params.card && payMethods.card)) {
              _context9.next = 10;
              break;
            }

            if (!(payMethods.card.gateway === 'stripe')) {
              _context9.next = 10;
              break;
            }

            _context9.next = 6;
            return stripe.createToken(card).then(function (_ref3) {
              var token = _ref3.token,
                  error = _ref3.error;
              return error ? onError(error) : token;
            });

          case 6:
            stripeToken = _context9.sent;
            cardData = {
              nonce: token.id,
              last4: token.card.last4,
              exp_month: token.card.exp_month,
              exp_year: token.card.exp_year,
              brand: token.card.brand,
              address_check: token.card.address_line1_check,
              cvc_check: token.card.cvc_check,
              zip_check: token.card.address_zip_check
            };
            _context9.next = 10;
            return cardApi.createToken(cardData).then(
            /*#__PURE__*/
            function () {
              var _ref5 = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee8(_ref4) {
                var token;
                return _regenerator["default"].wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        token = _ref4.token;
                        _context8.next = 3;
                        return cartApi.methods(request).update({
                          billing: {
                            card: {
                              token: token
                            }
                          }
                        });

                      case 3:
                        if (isFunction(params.onSuccess)) {
                          params.onSuccess(_objectSpread({}, cardData, {
                            token: token,
                            stripe_token: stripeToken.id
                          }));
                        }

                      case 4:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8);
              }));

              return function (_x17) {
                return _ref5.apply(this, arguments);
              };
            }())["catch"](function (err) {
              return onError(err);
            });

          case 10:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _paymentTokenize.apply(this, arguments);
}

module.exports = {
  methods: methods
};