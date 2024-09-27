function methods(api) {
  return {
    state: null,

    async requestStateChange(method, url, id, data) {
      const result = await api.request(method, url, id, data);
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
      if (password && password.password_token) {
        return this.requestStateChange('post', '/account/login', {
          email,
          password_token: password.password_token,
        });
      }
      return this.requestStateChange('post', '/account/login', {
        email,
        password,
      });
    },

    logout() {
      this.state = null;
      return api.request('post', '/account/logout');
    },

    recover(data) {
      return api.request('post', '/account/recover', data);
    },

    listAddresses(query) {
      return api.request('get', '/account/addresses', query);
    },

    createAddress(data) {
      return api.request('post', '/account/addresses', data);
    },

    updateAddress(id, data) {
      return api.request('put', `/account/addresses/${id}`, data);
    },

    deleteAddress(id) {
      return api.request('delete', `/account/addresses/${id}`);
    },

    listCards(query) {
      return api.request('get', '/account/cards', query);
    },

    createCard(data) {
      return api.request('post', '/account/cards', data);
    },

    updateCard(id, data) {
      return api.request('put', `/account/cards/${id}`, data);
    },

    deleteCard(id) {
      return api.request('delete', `/account/cards/${id}`);
    },

    listOrders(query) {
      return api.request('get', '/account/orders', query);
    },

    getOrder(id) {
      return api.request('get', `/account/orders/${id}`);
    },

    // Deprecated methods

    /**
     * @deprecated use `listAddresses` instead
     */
    getAddresses(query) {
      return api.request('get', '/account/addresses', query);
    },

    /**
     * @deprecated use `listCards` instead
     */
    getCards(query) {
      return api.request('get', '/account/cards', query);
    },

    /**
     * @deprecated use `listOrders` instead
     */
    getOrders(query) {
      return api.request('get', '/account/orders', query);
    },
  };
}

export default methods;
