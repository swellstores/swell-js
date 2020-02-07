function methods(request) {
  return {
    state: null,

    get() {
      if (this.state) {
        return this.state;
      }
      return this.refresh();
    },

    async refresh() {
      const result = await request('get', '/settings');
      return (this.state = result);
    },
  };
}


module.exports = {
  methods,
};
