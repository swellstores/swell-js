"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPaysafecardPayment = createPaysafecardPayment;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var get = require('lodash/get');

function createPaysafecardPayment(_x, _x2) {
  return _createPaysafecardPayment.apply(this, arguments);
}

function _createPaysafecardPayment() {
  _createPaysafecardPayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(cart, createIntent) {
    var returnUrl, url;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            returnUrl = window.location.origin + window.location.pathname;
            url = "".concat(returnUrl, "?gateway=paysafecard");
            _context.next = 4;
            return createIntent({
              gateway: 'paysafecard',
              intent: {
                type: 'PAYSAFECARD',
                amount: cart.grand_total,
                redirect: {
                  success_url: url,
                  failure_url: url
                },
                notification_url: url,
                customer: {
                  id: get(cart, 'account.id')
                },
                currency: get(cart, 'currency', 'USD')
              }
            });

          case 4:
            return _context.abrupt("return", _context.sent);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createPaysafecardPayment.apply(this, arguments);
}