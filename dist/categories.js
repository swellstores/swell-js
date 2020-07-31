"use strict";

var _require = require('./utils'),
    defaultMethods = _require.defaultMethods;

var cache = require('./cache');

function methods(request) {
  var _defaultMethods = defaultMethods(request, '/categories', ['list', 'get']),
      _get = _defaultMethods.get,
      list = _defaultMethods.list;

  return {
    get: function get(id) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return cache.getFetch('categories', id, function () {
        return _get.apply(void 0, [id].concat(args));
      });
    },
    list: list
  };
}

module.exports = {
  methods: methods
};