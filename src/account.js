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

    get(query) {
      return this.requestStateChange('get', '/account', query);
    },

    create(data) {
      return this.requestStateChange('post', '/account', data);
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

    listAddresses(query) {
      return request('get', '/account/addresses', query);
    },

    createAddress(data) {
      return request('post', '/account/addresses', data);
    },

    updateAddress(id, data) {
      return request('put', `/account/addresses/${id}`, data);
    },

    deleteAddress(id) {
      return request('delete', `/account/addresses/${id}`);
    },

    listCards(query) {
      return request('get', '/account/cards', query);
    },

    createCard(data) {
      return request('post', '/account/cards', data);
    },

    updateCard(id, data) {
      return request('put', `/account/cards/${id}`, data);
    },

    deleteCard(id) {
      return request('delete', `/account/cards/${id}`);
    },

    listOrders(query) {
      return request('get', `/account/orders`, query);
    },

    getOrder(id) {
      return request('get', `/account/orders/${id}`);
    },

    // Deprecated methods
    getAddresses(query) {
      return request('get', '/account/addresses', query);
    },
    getCards(query) {
      return request('get', '/account/cards', query);
    },
    getOrders(query) {
      return request('get', `/account/orders`, query);
    },
  };
}

export default methods;