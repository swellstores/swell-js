"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./utils'),
    trimStart = _require.trimStart,
    trimEnd = _require.trimEnd,
    toCamel = _require.toCamel;

var options = {
  vaultUrl: 'https://vault.schema.io',
  timeout: 20000
};
var request;
var api = {
  options: options,
  request: request,
  vaultRequest: vaultRequest,
  init: function init(opt, req) {
    options.key = opt.key;
    options.vaultUrl = opt.vaultUrl;
    options.useCamelCase = opt.useCamelCase;
    request = req;
  },
  createToken: function () {
    var _createToken = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(card) {
      var error, code, param, exp, err, result, _param, _err;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              error = null;
              code = null;
              param = null;

              if (!card) {
                error = 'Card details are missing in `swell.card.createToken(card)`';
                param = '';
              }

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

              if (!error) {
                _context.next = 14;
                break;
              }

              err = new Error(error);
              err.code = code || 'invalid_card';
              err.status = 402;
              err.param = param;
              throw err;

            case 14:
              _context.next = 16;
              return vaultRequest('post', '/tokens', card);

            case 16:
              result = _context.sent;

              if (!result.errors) {
                _context.next = 24;
                break;
              }

              _param = Object.keys(result.errors)[0];
              _err = new Error(result.errors[_param]);
              _err.params = _param;
              _err.code = 'vault_error';
              _err.status = 402;
              throw _err;

            case 24:
              return _context.abrupt("return", result);

            case 25:
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

function vaultRequest(_x2, _x3, _x4) {
  return _vaultRequest.apply(this, arguments);
}

function _vaultRequest() {
  _vaultRequest = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(method, url, data) {
    var opt,
        requestId,
        callback,
        _args2 = arguments;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            opt = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : undefined;
            requestId = vaultRequestId();
            callback = "swell_vault_response_".concat(requestId);
            data = {
              $jsonp: {
                method: method,
                callback: callback
              },
              $data: data,
              $key: options.key
            };
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              var script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = "".concat(trimEnd(options.vaultUrl), "/").concat(trimStart(url), "?").concat(serializeData(data));
              var errorTimeout = setTimeout(function () {
                window[callback]({
                  $error: "Request timed out after ".concat(options.timeout / 1000, " seconds"),
                  $status: 500
                });
              }, options.timeout);

              window[callback] = function (result) {
                clearTimeout(errorTimeout);

                if (result && result.$error) {
                  var err = new Error(result.$error);
                  err.code = 'request_error';
                  err.status = result.$status;
                  reject(err);
                } else if (!result || result.$status >= 300) {
                  var _err2 = new Error('A connection error occurred while making the request');

                  _err2.code = 'connection_error';
                  _err2.status = result.$status;
                  reject(_err2);
                } else {
                  resolve(options.useCamelCase ? toCamel(result.$data) : result.$data);
                }

                delete window[callback];
                script.parentNode.removeChild(script);
              };

              document.getElementsByTagName('head')[0].appendChild(script);
            }));

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _vaultRequest.apply(this, arguments);
}

function vaultRequestId() {
  window.__swell_vault_request_id = window.__swell_vault_request_id || 0;
  window.__swell_vault_request_id++;
  return window.__swell_vault_request_id;
}

function serializeData(data) {
  var key;
  var s = [];

  var add = function add(key, value) {
    // If value is a function, invoke it and return its value
    if (typeof value === 'function') {
      value = value();
    } else if (value == null) {
      value = '';
    }

    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  };

  for (var _key in data) {
    buildParams(_key, data[_key], add);
  }

  return s.join('&').replace(' ', '+');
}

var rbracket = /\[\]$/;

function buildParams(key, obj, add) {
  var name;

  if (obj instanceof Array) {
    for (var i = 0; i < obj.length; i++) {
      if (rbracket.test(key)) {
        // Treat each array item as a scalar.
        add(key, v);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(key + '[' + ((typeof v === "undefined" ? "undefined" : (0, _typeof2["default"])(v)) === 'object' && v != null ? i : '') + ']', v, add);
      }
    }
  } else if (obj && (0, _typeof2["default"])(obj) === 'object') {
    // Serialize object item.
    for (name in obj) {
      buildParams(key + '[' + name + ']', obj[name], add);
    }
  } else {
    // Serialize scalar item.
    add(key, obj);
  }
}

module.exports = api;