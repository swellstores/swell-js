function methods(request) {
  return {
    state: null,

    async requestStateChange(method, url, id, data) {
      const result = await request(method, url, id, data);
      if (result && result.errors) {
        return result;
      }
      return (this.state = result);
    },

    get() {
      return this.requestStateChange('get', '/account');
    },

    create(data, options) {
      return this.requestStateChange('post', '/account', { ...data, options });
    },

    update(data) {
      return this.requestStateChange('put', '/account', data);
    },

    login(email, password) {
      return this.requestStateChange('post', '/account/login', { email, password });
    },

    logout() {
      this.state = null;
      return request('post', '/account/logout');
    },

    recover(data) {
      return request('post', '/account/recover', data);
    },

    getAddresses(query) {
      return request('get', '/account/addresses', query);
    },

    createAddress(data) {
      return request('post', '/account/addresses', data);
    },

    deleteAddress(id) {
      return request('delete', `/account/addresses/${id}`);
    },

    getCards(query) {
      return request('get', '/account/cards', query);
    },

    createCard(data) {
      return request('post', '/account/cards', data);
    },

    deleteCard(id) {
      return request('delete', `/account/cards/${id}`);
    },

    getOrders(query) {
      return request('get', `/account/orders`, query);
    },
  };
}

module.exports = {
  methods,
};
