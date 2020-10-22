"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var reduce = require('lodash/reduce');

var isEmpty = require('lodash/isEmpty');

var get = require('lodash/get');

var toLower = require('lodash/toLower');

var map = require('lodash/map');

var toNumber = require('lodash/toNumber');

var addressFieldsMap = {
  city: 'city',
  country: 'country',
  line1: 'address1',
  line2: 'address2',
  postal_code: 'zip',
  state: 'state'
};
var billingFieldsMap = {
  name: 'name',
  phone: 'phone'
};

function getBillingDetails(billing) {
  var fillValues = function fillValues(fieldsMap) {
    return reduce(fieldsMap, function (acc, value, key) {
      var billingValue = billing[value];

      if (billingValue) {
        acc[key] = billingValue;
      }

      return acc;
    }, {});
  };

  var billingDetails = fillValues(billingFieldsMap);

  if (!isEmpty(billingDetails)) {
    var address = fillValues(addressFieldsMap);
    return _objectSpread({}, billingDetails, {}, !isEmpty(address) ? {
      address: address
    } : {});
  }
}

function getKlarnaItems(cart) {
  var currency = toLower(get(cart, 'currency', 'eur'));
  var items = map(cart.items, function (item) {
    return {
      type: 'sku',
      description: item.product.name,
      quantity: item.quantity,
      currency: currency,
      amount: Math.round(toNumber(item.price_total - item.discount_total) * 100)
    };
  });
  var tax = get(cart, 'tax_included_total');

  if (tax) {
    items.push({
      type: 'tax',
      description: 'Taxes',
      currency: currency,
      amount: toNumber(tax) * 100
    });
  }

  var shipping = get(cart, 'shipping', {});
  var shippingTotal = get(cart, 'shipment_total', {});

  if (shipping.price) {
    items.push({
      type: 'shipping',
      description: shipping.service_name,
      currency: currency,
      amount: toNumber(shippingTotal) * 100
    });
  }

  return items;
}

function setKlarnaBillingShipping(source, data) {
  var shippingNameFieldsMap = {
    shipping_first_name: 'first_name',
    shipping_last_name: 'last_name'
  };
  var shippingFieldsMap = {
    phone: 'phone'
  };
  var billingNameFieldsMap = {
    first_name: 'first_name',
    last_name: 'last_name'
  };
  var billingFieldsMap = {
    email: 'email'
  };

  var fillValues = function fillValues(fieldsMap, data) {
    return reduce(fieldsMap, function (acc, srcKey, destKey) {
      var value = data[srcKey];

      if (value) {
        acc[destKey] = value;
      }

      return acc;
    }, {});
  };

  source.klarna = _objectSpread({}, source.klarna, {}, fillValues(shippingNameFieldsMap, data.shipping));
  var shipping = fillValues(shippingFieldsMap, data.shipping);
  var shippingAddress = fillValues(addressFieldsMap, data.shipping);

  if (shipping || shippingAddress) {
    source.source_order.shipping = _objectSpread({}, shipping ? shipping : {}, {}, shippingAddress ? {
      address: shippingAddress
    } : {});
  }

  source.klarna = _objectSpread({}, source.klarna, {}, fillValues(billingNameFieldsMap, data.billing || get(data, 'account.billing') || data.shipping));
  var billing = fillValues(billingFieldsMap, data.account);
  var billingAddress = fillValues(addressFieldsMap, data.billing || get(data, 'account.billing') || data.shipping);

  if (billing || billingAddress) {
    source.owner = _objectSpread({}, billing ? billing : {}, {}, billingAddress ? {
      address: billingAddress
    } : {});
  }
}

function createPaymentMethod(_x, _x2) {
  return _createPaymentMethod.apply(this, arguments);
}

function _createPaymentMethod() {
  _createPaymentMethod = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(stripe, cardElement) {
    var billing,
        billingDetails,
        _ref,
        error,
        paymentMethod,
        _args = arguments;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            billing = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
            billingDetails = getBillingDetails(billing);
            _context.next = 4;
            return stripe.createPaymentMethod(_objectSpread({
              type: 'card',
              card: cardElement
            }, billingDetails ? {
              billing_details: billingDetails
            } : {}));

          case 4:
            _ref = _context.sent;
            error = _ref.error;
            paymentMethod = _ref.paymentMethod;
            return _context.abrupt("return", error ? {
              error: error
            } : {
              token: paymentMethod.id,
              last4: paymentMethod.card.last4,
              exp_month: paymentMethod.card.exp_month,
              exp_year: paymentMethod.card.exp_year,
              brand: paymentMethod.card.brand,
              address_check: paymentMethod.card.checks.address_line1_check,
              cvc_check: paymentMethod.card.checks.cvc_check,
              zip_check: paymentMethod.card.checks.address_zip_check
            });

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createPaymentMethod.apply(this, arguments);
}

function createIDealPaymentMethod(_x3, _x4) {
  return _createIDealPaymentMethod.apply(this, arguments);
}

function _createIDealPaymentMethod() {
  _createIDealPaymentMethod = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(stripe, element) {
    var billing,
        billingDetails,
        _args2 = arguments;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            billing = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {};
            billingDetails = getBillingDetails(billing);
            _context2.next = 4;
            return stripe.createPaymentMethod(_objectSpread({
              type: 'ideal',
              ideal: element
            }, billingDetails ? {
              billing_details: billingDetails
            } : {}));

          case 4:
            return _context2.abrupt("return", _context2.sent);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _createIDealPaymentMethod.apply(this, arguments);
}

function createKlarnaSource(_x5, _x6, _x7) {
  return _createKlarnaSource.apply(this, arguments);
}

function _createKlarnaSource() {
  _createKlarnaSource = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(stripe, cart, billing) {
    var sourceObject;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            sourceObject = {
              type: 'klarna',
              flow: 'redirect',
              amount: Math.round(get(cart, 'grand_total', 0) * 100),
              currency: toLower(get(cart, 'currency', 'eur')),
              klarna: {
                product: 'payment',
                purchase_country: get(cart, 'settings.country', 'DE')
              },
              source_order: {
                items: getKlarnaItems(cart)
              },
              redirect: {
                return_url: window.location.href
              }
            };
            setKlarnaBillingShipping(sourceObject, _objectSpread({}, cart, {
              billing: billing
            }));
            _context3.next = 4;
            return stripe.createSource(sourceObject);

          case 4:
            return _context3.abrupt("return", _context3.sent);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _createKlarnaSource.apply(this, arguments);
}

module.exports = {
  createPaymentMethod: createPaymentMethod,
  createIDealPaymentMethod: createIDealPaymentMethod,
  createKlarnaSource: createKlarnaSource
};