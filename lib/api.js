const qs = require('qs');

require('isomorphic-fetch');

let options = {
  store: null,
  key: null,
  url: null,
};

const api = {
  options,
  request,

  auth(store, key, opt = {}) {
    options.key = key;
    options.store = store;
    options.url = opt.url ? trimEnd(opt.url) : `https://${store}.swell.store`;
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

    async requestStateChange(method, url, id, data) {
      this.state = await request(method, url, id, data);
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

    async requestStateChange(method, url, id, data) {
      this.state = await request(method, url, id, data);
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

async function request(method, url, id = undefined, data = undefined) {
  const reqMethod = String(method).toLowerCase();

  let reqUrl = url;
  let reqData = id;

  if (data !== undefined || typeof id === 'string') {
    reqUrl = [ trimEnd(url), trimStart(id) ].join('/');
    reqData = data;
  }

  reqUrl = `${options.url}/api/${trimBoth(reqUrl)}`;

  let reqBody;
  if (reqMethod === 'get') {
    let exQuery;
    [ reqUrl, exQuery ] = reqUrl.split('?');
    const fullQuery = [ exQuery, stringifyQuery(reqData) ].join('&').replace(/^&/, '');
    reqUrl = `${reqUrl}${fullQuery ? `?${fullQuery}` : ''}`;
  } else {
    reqBody = JSON.stringify(reqData);
  }

  const reqHeaders = new Headers({
    Authorization: `Basic ${Buffer.from(options.key).toString('base64')}`,
  });

  const response = await fetch(reqUrl, {
    method: reqMethod,
    headers: reqHeaders,
    body: reqBody,
    credentials: 'include',
    mode: 'cors',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error.message);
  }

  return result;
}

function trimBoth(str) {
  return trimStart(trimEnd(str));
}

function trimStart(str) {
  return str.replace(/^[\/]+/, '');
}

function trimEnd(str) {
  return str.replace(/[\/]+$/, '');
}

function stringifyQuery(str) {
  return qs.stringify(str, {
    depth: 10,
    encode: false,
  });
}

module.exports = api;
