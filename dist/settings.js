"use strict";

var _require = require('./utils'),
    get = _require.get,
    find = _require.find;

function methods(request) {
  return {
    state: null,
    menuState: null,
    paymentState: null,
    refresh: function refresh() {
      this.state = null;
      this.menuState = null;
      this.paymentState = null;
      return this.get();
    },
    getState: function getState(uri, stateName) {
      var _this = this;

      var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var def = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

      if (!this[stateName]) {
        this[stateName] = request('get', uri);
      }

      if (typeof this[stateName].then === 'function') {
        return this[stateName].then(function (state) {
          _this[stateName] = state;
          return id ? get(state, id, def) : state;
        });
      }

      return id ? get(this[stateName], id, def) : this[stateName];
    },
    findState: function findState(uri, stateName) {
      var where = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
      var def = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
      return this.getState(uri, stateName).then(function (state) {
        return find(state, where) || def;
      });
    },
    load: function load() {
      return this.getState('/settings', 'state');
    },
    get: function get() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.getState('/settings', 'state', id, def);
    },
    menus: function menus() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.findState('/settings/menus', 'menuState', {
        id: id
      }, def);
    },
    payments: function payments() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      return this.getState('/settings/payments', 'paymentState', id, def);
    }
  };
}

module.exports = {
  methods: methods
};