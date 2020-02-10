import { find } from 'lodash';

function methods(request) {
  return {
    state: null,

    async refresh() {
      const result = await request('get', '/settings');
      return (this.state = result);
    },

    get() {
      if (this.state) {
        return this.state;
      }
      return this.refresh();
    },

    async getMenu(id) {
      return find(await this.get(), id);
    },
  };
}

module.exports = {
  methods,
};
