const { trimStart, trimEnd } = require('lodash');

require('isomorphic-fetch');

let options = {
  publicKey: null,
  storeId: null,
  storeUrl: null,
};

const api = {
  request,

  auth(storeId, publicKey, opt = {}) {
    options = {
      publicKey,
      storeId,
      storeUrl: opt.storeUrl || `https://${storeId}.swell.store`,
    };
  },

  get(url, query) {
    return request('get', url, query);
  },

  put(url, data) {
    return request('put', url, data);
  },

  post(url, data) {
    return request('post', url, data);
  },

  delete(url, data) {
    return request('delete', url, data);
  },

  products: {
    get(query) {
      return request('get', '/products', query);
    },
  },

  cart: {
    state: null,

    async requestStateChange(method, url, data) {
      this.state = await request(method, url, data);
      return this.state;
    },

    get() {
      return this.requestStateChange('get', '/cart');
    },

    addItem(item) {
      return this.requestStateChange('post', '/cart/items', item);
    },

    updateItems(items) {
      return this.requestStateChange('put', '/cart/items', items);
    },

    updateItem(id, item) {
      return this.requestStateChange('put', `/cart/items/${id}`, item);
    },

    removeItems() {
      return this.requestStateChange('delete', '/cart/items');
    },

    removeItem(id) {
      return this.requestStateChange('delete', `/cart/items/${id}`);
    },

    recover(checkoutId) {
      return this.requestStateChange('put', `/cart/recover/${checkoutId}`);
    },
  },

  account: {
    state: null,

    async requestStateChange(method, url, data) {
      this.state = await request(method, url, data);
      return this.state;
    },

    get() {
      return this.requestStateChange('get', '/account');
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
      return this.requestStateChange('post', '/account/logout');
    },

    recover(data) {
      return this.requestStateChange('post', '/account/recover', data);
    },

    getAddresses(query) {
      return this.requestStateChange('get', '/account/addresses', query);
    },

    createAddress(data) {
      return this.requestStateChange('post', '/account/addresses', data);
    },

    deleteAddress(id) {
      return this.requestStateChange('delete', `/account/addresses/${id}`);
    },

    getCards(query) {
      return this.requestStateChange('get', '/account/cards', query);
    },

    createCard(data) {
      return this.requestStateChange('post', '/account/cards', data);
    },

    deleteCard(id) {
      return this.requestStateChange('delete', `/account/cards/${id}`);
    },
  },
};

async function request(method, url, data = {}) {
  const apiMethod = String(method).toLowerCase();
  const apiUrl = `${trimEnd(options.storeUrl, '/')}/api/${trimStart(url, '/')}`;

  const response = await fetch(apiUrl, {
    method,
    mode: 'cors', // necessary?
    credentials: 'include',
    headers: new Headers({
      Authorization: `Basic ${new Buffer(options.publicKey).toString('base64')}`,
    }),
    body: apiMethod !== 'get' ? JSON.stringify(data) : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error.message);
  }

  return result;
}

module.exports = api;
