"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _require = require('./utils'),
    isServer = _require.isServer;

function getCookie(name) {
  if (isServer()) {
    return undefined;
  }

  var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (isServer()) {
    return;
  }

  var date = new Date();
  date.setDate(date.getDate() + 7); // 1 week

  options = (0, _objectSpread2["default"])({
    path: '/',
    expires: date.toUTCString()
  }, options);

  if (options.expires && options.expires.toUTCString) {
    options.expires = options.expires.toUTCString();
  }

  var updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  for (var optionKey in options) {
    updatedCookie += '; ' + optionKey;
    var optionValue = options[optionKey];

    if (optionValue !== true) {
      updatedCookie += '=' + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

module.exports = {
  getCookie: getCookie,
  setCookie: setCookie
};