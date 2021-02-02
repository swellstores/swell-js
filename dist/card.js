"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./utils'),
    vaultRequest = _require.vaultRequest,
    toSnake = _require.toSnake;

var cardApi = {
  createToken: function () {
    var _createToken = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(data) {
      var error, code, param, card, exp, err, result, _param, _err;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              error = null;
              code = null;
              param = null;

              if (!data) {
                error = 'Card details are missing in `swell.card.createToken(card)`';
                param = '';
              }

              card = toSnake(data);

              if (!card.nonce) {
                if (!this.validateNumber(card.number)) {
                  error = 'Card number appears to be invalid';
                  code = 'invalid_card_number';
                  param = 'number';
                }

                if (card.exp) {
                  exp = this.expiry(card.exp);
                  card.exp_month = exp.month;
                  card.exp_year = exp.year;
                }

                if (!this.validateExpiry(card.exp_month, card.exp_year)) {
                  error = 'Card expiry appears to be invalid';
                  code = 'invalid_card_expiry';
                  param = 'exp_month';
                }

                if (!this.validateCVC(card.cvc)) {
                  error = 'Card CVC code appears to be invalid';
                  code = 'invalid_card_cvc';
                  param = 'exp_cvc';
                }
              }

              if (!error) {
                _context.next = 12;
                break;
              }

              err = new Error(error);
              err.code = code || 'invalid_card';
              err.status = 402;
              err.param = param;
              throw err;

            case 12:
              _context.next = 14;
              return vaultRequest('post', '/tokens', card);

            case 14:
              result = _context.sent;

              if (!result.errors) {
                _context.next = 22;
                break;
              }

              _param = Object.keys(result.errors)[0];
              _err = new Error(result.errors[_param].message || 'Unknown error');
              _err.code = 'vault_error';
              _err.status = 402;
              _err.param = _param;
              throw _err;

            case 22:
              return _context.abrupt("return", result);

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function createToken(_x) {
      return _createToken.apply(this, arguments);
    }

    return createToken;
  }(),
  expiry: function expiry(value) {
    if (value && value.month && value.year) {
      return value;
    }

    var parts = new String(value).split(/[\s\/\-]+/, 2);
    var month = parts[0];
    var year = parts[1]; // Convert 2 digit year

    if (year && year.length === 2 && /^\d+$/.test(year)) {
      var prefix = new Date().getFullYear().toString().substring(0, 2);
      year = prefix + year;
    }

    return {
      month: ~~month,
      year: ~~year
    };
  },
  types: function types() {
    var e, t, n, r;
    t = {};

    for (e = n = 40; n <= 49; e = ++n) {
      t[e] = 'Visa';
    }

    for (e = r = 50; r <= 59; e = ++r) {
      t[e] = 'MasterCard';
    }

    return t[34] = t[37] = 'American Express', t[60] = t[62] = t[64] = t[65] = 'Discover', t[35] = 'JCB', t[30] = t[36] = t[38] = t[39] = 'Diners Club', t;
  },
  type: function type(num) {
    return this.types()[num.slice(0, 2)] || 'Unknown';
  },
  luhnCheck: function luhnCheck(num) {
    var t, n, r, i, s, o;
    r = !0, i = 0, n = (num + '').split('').reverse();

    for (s = 0, o = n.length; s < o; s++) {
      t = n[s], t = parseInt(t, 10);
      if (r = !r) t *= 2;
      t > 9 && (t -= 9), i += t;
    }

    return i % 10 === 0;
  },
  validateNumber: function validateNumber(num) {
    return num = (num + '').replace(/\s+|-/g, ''), num.length >= 10 && num.length <= 16 && this.luhnCheck(num);
  },
  validateExpiry: function validateExpiry(month, year) {
    var r, i;
    return month = String(month).trim(), year = String(year).trim(), /^\d+$/.test(month) ? /^\d+$/.test(year) ? parseInt(month, 10) <= 12 ? (i = new Date(year, month), r = new Date(), i.setMonth(i.getMonth() - 1), i.setMonth(i.getMonth() + 1, 1), i > r) : !1 : !1 : !1;
  },
  validateCVC: function validateCVC(val) {
    return val = String(val).trim(), /^\d+$/.test(val) && val.length >= 3 && val.length <= 4;
  }
};
module.exports = cardApi;