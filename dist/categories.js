"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _require = require('./utils'),
    defaultMethods = _require.defaultMethods;

function methods(request) {
  return (0, _objectSpread2["default"])({}, defaultMethods(request, '/categories', ['list', 'get']));
}

module.exports = {
  methods: methods
};