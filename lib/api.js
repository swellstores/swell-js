const { normalizeKeys } = require('object-keys-normalizer');
const qs = require('qs');

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

  auth(store, key, opt = {}) {
    options.key = key;
    options.store = store;
    options.url = opt.url ? trimEnd(opt.url) : `https://${store}.swell.store`;
    options.useCamelCase = opt.useCamelCase || false;
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
    reqUrl = [trimEnd(url), trimStart(id)].join('/');
    reqData = data;
  }

  reqUrl = `${options.url}/api/${trimBoth(reqUrl)}`;
  reqData = options.useCamelCase ? toSnake(reqData) : reqData;

  let reqBody;
  if (reqMethod === 'get') {
    let exQuery;
    [reqUrl, exQuery] = reqUrl.split('?');
    const fullQuery = [exQuery, stringifyQuery(reqData)].join('&').replace(/^&/, '');
    reqUrl = `${reqUrl}${fullQuery ? `?${fullQuery}` : ''}`;
  } else {
    reqBody = JSON.stringify(reqData);
  }

  const reqHeaders = new Headers({
    'Content-Type': 'application/json',
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

  return options.useCamelCase ? toCamel(result) : result;
}

function toCamel(obj) {
  return normalizeKeys(obj, 'camel');
}

function toSnake(obj) {
  if (!obj) return;
  // Make a copy to avoid mutating source object
  const objCopy = JSON.parse(JSON.stringify(obj));
  return normalizeKeys(objCopy, 'snake');
}

function trimBoth(str) {
  return trimStart(trimEnd(str));
}

function trimStart(str) {
  return str.replace(/^[/]+/, '');
}

function trimEnd(str) {
  return str.replace(/[/]+$/, '');
}

function stringifyQuery(str) {
  return qs.stringify(str, {
    depth: 10,
    encode: false,
  });
}

module.exports = api;
