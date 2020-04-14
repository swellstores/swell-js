const { find } = require('lodash');

function methods(request) {
  return {
    state: null,
    paymentState: null,

    async get(query) {
      if (this.state) {
        return this.state;
      }
      const result = await request('get', '/settings', query);
      return (this.state = result);
    },

    refresh() {
      this.state = null;
      this.paymentState = null;
      return this.get();
    },

    async getMenu(id) {
      return find(await this.get(), id);
    },

    async payments() {
      if (this.paymentState) {
        return this.paymentState;
      }
      const result = await request('get', '/settings/payments');
      return (this.paymentState = result);
    },
  };
}

module.exports = {
  methods,
};
