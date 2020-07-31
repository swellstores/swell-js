const { get, find, set, merge, toCamel } = require('./utils');

function methods(request, opt) {
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

    getState(uri, stateName, { id = undefined, def = undefined, refresh = false } = {}) {
      if (!this[stateName] || refresh) {
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

    findState(uri, stateName, { where = undefined, def = undefined } = {}) {
      const state = this.getState(uri, stateName);
      if (state && typeof state.then === 'function') {
        return state.then((state) => find(state, where) || def);
      }
      return find(state, where) || def;
    },

    get(id = undefined, def = undefined) {
      return this.getState('/settings', 'state', { id, def });
    },

    set({ model, path, value }) {
      const stateName = model ? `${model.replace(/s$/, '')}State` : 'state';
      const { useCamelCase } = opt;
      let mergeData = {};
      if (model === 'menus') {
        if (path !== undefined) {
          set(mergeData, path || '', value);
        } else {
          mergeData = value;
        }
      } else {
        set(mergeData, path || '', value);
      }
      if (useCamelCase) {
        mergeData = toCamel(mergeData);
      }
      this[stateName] = merge(this[stateName], mergeData);
    },

    menus(id = undefined, def = undefined) {
      return this.findState('/settings/menus', 'menuState', { where: { id }, def });
    },

    payments(id = undefined, def = undefined) {
      return this.getState('/settings/payments', 'paymentState', { id, def });
    },

    async load() {
      try {
        const { settings, menus, payments } = await request('get', '/settings/all');
        this.state = settings;
        this.menuState = menus;
        this.paymentState = payments;
      } catch (err) {
        console.error(`Swell: unable to loading settings (${err})`);
      }
    },
  };
}

module.exports = {
  methods,
};
