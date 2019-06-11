const card = require('./card');
const { getCookie, setCookie } = require('./cookie');
const { toCamel, toSnake, trimBoth, trimStart, trimEnd, stringifyQuery } = require('./utils');

require('isomorphic-fetch');

const options = {
  store: null,
  key: null,
  url: null,
  useCamelCase: null,
};

const api = {
  options,
  request,

  init(store, key, opt = {}) {
    options.key = key;
    options.store = store;
    options.url = opt.url ? trimEnd(opt.url) : `https://${store}.swell.store`;
    options.vaultUrl = opt.vaultUrl ? trimEnd(opt.vaultUrl) : `https://vault.schema.io`;
    options.useCamelCase = opt.useCamelCase || false;

    card.init(options, request);
  },

  // Backward compatibility
  auth(...args) {
    return this.init(...args);
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
    get(id, query) {
      return request('get', '/products', id, query);
    },
  },

  categories: {
    get(id, query) {
      return request('get', '/categories', id, query);
    },
  },

  cart: {
    state: null,
    order: null,
    settings: null,

    async requestStateChange(method, url, id, data) {
      const result = await request(method, url, id, data);
      if (result && result.errors) {
        return result;
      }
      this.state = result;
      return result;
    },

    get() {
      return this.requestStateChange('get', '/cart');
    },

    addItem(item) {
      if (typeof item === 'string') {
        return this.requestStateChange('post', '/cart/items', {
          product_id: item,
        });
      }
      return this.requestStateChange('post', '/cart/items', item);
    },

    setItems(items) {
      return this.requestStateChange('put', '/cart/items', items);
    },

    updateItem(id, item) {
      return this.requestStateChange('put', `/cart/items/${id}`, item);
    },

    removeItem(id) {
      return this.requestStateChange('delete', `/cart/items/${id}`);
    },

    recover(checkoutId) {
      return this.requestStateChange('put', `/cart/recover/${checkoutId}`);
    },

    update(data) {
      return this.requestStateChange('put', `/cart`, data);
    },

    applyCoupon(code) {
      return this.requestStateChange('put', '/cart/coupon', { code });
    },

    removeCoupon() {
      return this.requestStateChange('delete', '/cart/coupon');
    },

    applyGiftcard(code) {
      return this.requestStateChange('post', '/cart/giftcards', { code });
    },

    removeGiftcard(id) {
      return this.requestStateChange('delete', `/cart/giftcards/${id}`);
    },

    async getShippingRates() {
      await this.requestStateChange('get', '/cart/shipment-rating');
      return this.state[options.useCamelCase ? 'shipmentRating' : 'shipment_rating'];
    },

    async submitOrder() {
      const result = await request('post', '/cart/order');
      if (result.errors) {
        return result;
      }
      this.state = null;
      this.order = result;
      return result;
    },

    async getOrder(checkoutId = undefined) {
      let result;
      if (checkoutId) {
        result = await request('get', `/cart/order`, { checkout_id: checkoutId });
      } else {
        result = await request('get', `/cart/order`);
      }
      this.order = result;
      return result;
    },

    async getSettings() {
      this.settings = await request('get', '/cart/settings');
      return this.settings;
    },
  },

  subscriptions: {
    get(id, query) {
      return request('get', '/subscriptions', id, query);
    },

    create(data) {
      return request('post', '/subscriptions', data);
    },

    update(id, data) {
      return request('put', `/subscriptions/${id}`, data);
    },

    addItem(id, item) {
      return request('post', `/subscriptions/${id}/items`, item);
    },

    setItems(id, items) {
      return request('put', `/subscriptions/${id}/items`, items);
    },

    updateItem(id, itemId, item) {
      return request('put', `/subscriptions/${id}/items/${itemId}`, item);
    },

    removeItem(id, itemId) {
      return request('delete', `/subscriptions/${id}/items/${itemId}`);
    },
  },

  account: {
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
  },

  card,
};

async function request(method, url, id = undefined, data = undefined, opt = undefined) {
  const reqMethod = String(method).toLowerCase();

  let reqUrl = url;
  let reqData = id;

  if (data !== undefined || typeof id === 'string') {
    reqUrl = [trimEnd(url), trimStart(id)].join('/');
    reqData = data;
  }

  const allOptions = {
    ...options,
    ...opt,
  };

  const baseUrl = `${allOptions.url}${allOptions.base || ''}/api`;

  reqUrl = allOptions.fullUrl || `${baseUrl}/${trimBoth(reqUrl)}`;
  reqData = allOptions.useCamelCase ? toSnake(reqData) : reqData;

  let reqBody;
  if (reqMethod === 'get') {
    let exQuery;
    [reqUrl, exQuery] = reqUrl.split('?');
    const fullQuery = [exQuery, stringifyQuery(reqData)].join('&').replace(/^&/, '');
    reqUrl = `${reqUrl}${fullQuery ? `?${fullQuery}` : ''}`;
  } else {
    reqBody = JSON.stringify(reqData);
  }

  const session = getCookie('swell-session');
  const reqHeaders = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(allOptions.key).toString('base64')}`,
    ...(session ? { 'X-Session': session } : {}),
  });

  const response = await fetch(reqUrl, {
    method: reqMethod,
    headers: reqHeaders,
    body: reqBody,
    credentials: 'include',
    mode: 'cors',
  });
  const responseSession = response.headers.get('X-Session');

  if (session !== responseSession) {
    setCookie('swell-session', responseSession);
  }

  const result = await response.json();

  if (result && result.error) {
    const err = new Error(result.error.message);
    err.status = response.status;
    err.code = result.error.code;
    err.param = result.error.param;
    throw err;
  } else if (!response.ok) {
    const err = new Error('A connection error occurred while making the request');
    err.code = 'connection_error';
    throw err;
  }

  return options.useCamelCase ? toCamel(result) : result;
}

module.exports = api;
