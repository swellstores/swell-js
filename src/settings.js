const { get, find } = require('./utils');

function methods(request) {
  return {
    state: null,
    menuState: null,
    paymentState: null,

    refresh() {
      this.state = null;
      this.menuState = null;
      this.paymentState = null;
      return this.get();
    },

    getState(uri, stateName, id = undefined, def = undefined) {
      if (!this[stateName]) {
        this[stateName] = request('get', uri);
      }
      if (this[stateName] && typeof this[stateName].then === 'function') {
        return this[stateName].then((state) => {
          this[stateName] = state;
          return id ? get(state, id, def) : state;
        });
      }
      return id ? get(this[stateName], id, def) : this[stateName];
    },

    findState(uri, stateName, where = undefined, def = undefined) {
      const state = this.getState(uri, stateName);
      if (state && typeof state.then === 'function') {
        return state.then((state) => find(state, where) || def);
      }
      return find(state, where) || def;
    },

    load() {
      return this.getState('/settings', 'state');
    },

    get(id = undefined, def = undefined) {
      return this.getState('/settings', 'state', id, def);
    },

    menus(id = undefined, def = undefined) {
      return this.findState('/settings/menus', 'menuState', { id }, def);
    },

    payments(id = undefined, def = undefined) {
      return this.getState('/settings/payments', 'paymentState', id, def);
    }
  };
}

module.exports = {
  methods,
};
