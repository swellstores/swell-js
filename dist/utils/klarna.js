"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('lodash'),
    map = _require.map,
    get = _require.get,
    reduce = _require.reduce,
    toNumber = _require.toNumber;

var addressFieldsMap = {
  given_name: 'first_name',
  family_name: 'last_name',
  city: 'city',
  country: 'country',
  phone: 'phone',
  postal_code: 'zip',
  street_address: 'address1',
  street_address2: 'address2',
  region: 'state'
};

var mapFields = function mapFields(fieldsMap, data) {
  return reduce(fieldsMap, function (acc, srcKey, destKey) {
    var value = data[srcKey];

    if (value) {
      acc[destKey] = value;
    }

    return acc;
  }, {});
};

var mapAddressFields = function mapAddressFields(cart, addressField) {
  return _objectSpread(_objectSpread({}, mapFields(addressFieldsMap, cart[addressField])), {}, {
    email: get(cart, 'account.email')
  });
};

function getOrderLines(cart) {
  var items = map(cart.items, function (item) {
    return {
      type: 'physical',
      name: get(item, 'product.name'),
      reference: get(item, 'product.sku') || get(item, 'product.slug'),
      quantity: item.quantity,
      unit_price: Math.round(toNumber(item.price - item.discount_each) * 100),
      total_amount: Math.round(toNumber(item.price_total - item.discount_total) * 100),
      tax_rate: 0,
      total_tax_amount: 0
    };
  });
  var tax = get(cart, 'tax_included_total');
  var taxAmount = toNumber(tax) * 100;

  if (tax) {
    items.push({
      type: 'sales_tax',
      name: 'Taxes',
      quantity: 1,
      unit_price: taxAmount,
      total_amount: taxAmount,
      tax_rate: 0,
      total_tax_amount: 0
    });
  }

  var shipping = get(cart, 'shipping', {});
  var shippingTotal = get(cart, 'shipment_total', {});
  var shippingAmount = toNumber(shippingTotal) * 100;

  if (shipping.price) {
    items.push({
      type: 'shipping_fee',
      name: shipping.service_name,
      quantity: 1,
      unit_price: shippingAmount,
      total_amount: shippingAmount,
      tax_rate: 0,
      total_tax_amount: 0
    });
  }

  return items;
}

function createKlarnaSession(_x, _x2) {
  return _createKlarnaSession.apply(this, arguments);
}

function _createKlarnaSession() {
  _createKlarnaSession = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(cart, createIntent) {
    var returnUrl, successUrl;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            returnUrl = "".concat(window.location.origin).concat(window.location.pathname, "?gateway=klarna_direct&sid={{session_id}}");
            successUrl = "".concat(returnUrl, "&authorization_token={{authorization_token}}");
            return _context.abrupt("return", createIntent({
              gateway: 'klarna',
              intent: {
                locale: get(cart, 'settings.locale') || 'en-US',
                purchase_country: get(cart, 'billing.country') || get(cart, 'shipping.country'),
                purchase_currency: cart.currency,
                billing_address: mapAddressFields(cart, 'billing'),
                shipping_address: mapAddressFields(cart, 'shipping'),
                order_amount: Math.round(get(cart, 'grand_total', 0) * 100),
                order_lines: JSON.stringify(getOrderLines(cart)),
                merchant_urls: {
                  success: successUrl,
                  back: returnUrl,
                  cancel: returnUrl,
                  error: returnUrl,
                  failure: returnUrl
                }
              }
            }));

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createKlarnaSession.apply(this, arguments);
}

module.exports = {
  createKlarnaSession: createKlarnaSession
};