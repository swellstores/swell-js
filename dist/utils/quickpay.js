"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createQuickpayCard = createQuickpayCard;
exports.getQuickpayCardDetais = getQuickpayCardDetais;
exports.createQuickpayPayment = createQuickpayPayment;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var get = require('lodash/get');

function generateOrderId() {
  return Math.random().toString(36).substr(2, 9);
}

function createQuickpayCard(_x) {
  return _createQuickpayCard.apply(this, arguments);
}

function _createQuickpayCard() {
  _createQuickpayCard = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(authorize) {
    var returnUrl, authorization;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            returnUrl = window.location.origin + window.location.pathname;
            _context.next = 3;
            return authorize({
              gateway: 'quickpay',
              params: {
                action: 'create',
                continueurl: "".concat(returnUrl, "?gateway=quickpay&redirect_status=succeeded"),
                cancelurl: "".concat(returnUrl, "?gateway=quickpay&redirect_status=canceled")
              }
            });

          case 3:
            authorization = _context.sent;

            if (authorization && authorization.url) {
              window.location.replace(authorization.url);
            }

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createQuickpayCard.apply(this, arguments);
}

function getQuickpayCardDetais(_x2, _x3) {
  return _getQuickpayCardDetais.apply(this, arguments);
}

function _getQuickpayCardDetais() {
  _getQuickpayCardDetais = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(id, authorize) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return authorize({
              gateway: 'quickpay',
              params: {
                action: 'get',
                id: id
              }
            });

          case 2:
            return _context2.abrupt("return", _context2.sent);

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getQuickpayCardDetais.apply(this, arguments);
}

function createQuickpayPayment(_x4, _x5) {
  return _createQuickpayPayment.apply(this, arguments);
}

function _createQuickpayPayment() {
  _createQuickpayPayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(cart, createIntent) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return createIntent({
              gateway: 'quickpay',
              intent: {
                currency: get(cart, 'currency', 'USD'),
                order_id: generateOrderId()
              }
            });

          case 2:
            return _context3.abrupt("return", _context3.sent);

          case 3:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _createQuickpayPayment.apply(this, arguments);
}