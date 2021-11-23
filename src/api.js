const card = require('./card');
const { getCookie, setCookie } = require('./cookie');
const {
  setOptions,
  toCamel,
  toSnake,
  trimBoth,
  trimStart,
  trimEnd,
  stringifyQuery,
  base64Encode,
} = require('./utils');
const cache = require('./cache');
const cart = require('./cart');
const account = require('./account');
const products = require('./products');
const categories = require('./categories');
const attributes = require('./attributes');
const subscriptions = require('./subscriptions');
const content = require('./content');
const settings = require('./settings');
const payment = require('./payment');
const locale = require('./locale');
const currency = require('./currency');

require('isomorphic-fetch');

const options = {
  store: null,
  key: null,
  url: null,
  useCamelCase: null,
  previewContent: null,
};

const api = {
  options,
  request,

  init(store, key, opt = {}) {
    options.key = key;
    options.store = store;
    options.url = opt.url ? trimEnd(opt.url) : `https://${store}.swell.store`;
    options.vaultUrl = opt.vaultUrl ? trimEnd(opt.vaultUrl) : `https://vault.schema.io`;
    options.timeout = (opt.timeout && parseInt(opt.timeout, 10)) || 20000;
    options.useCamelCase = opt.useCamelCase || false;
    options.previewContent = opt.previewContent || false;
    options.session = opt.session;
    options.locale = opt.locale;
    options.currency = opt.currency;
    options.api = api;
    setOptions(options);
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

  cache,

  card,

  cart: cart.methods(request, options),

  account: account.methods(request, options),

  products: products.methods(request, options),

  categories: categories.methods(request, options),

  attributes: attributes.methods(request, options),

  subscriptions: subscriptions.methods(request, options),

  content: content.methods(request, options),

  settings: settings.methods(request, options),

  payment: payment.methods(request, options),

  locale: locale.methods(request, options),

  currency: currency.methods(request, options),
};

async function request(method, url, id = undefined, data = undefined, opt = undefined) {
  const allOptions = {
    ...options,
    ...opt,
  };

  const session = allOptions.session || getCookie('swell-session');
  const locale = allOptions.locale || getCookie('swell-locale');
  const currency = allOptions.currency || getCookie('swell-currency');

  const baseUrl = `${allOptions.url}${allOptions.base || ''}/api`;
  const reqMethod = String(method).toLowerCase();

  let reqUrl = url;
  let reqData = id;

  if (data !== undefined || typeof id === 'string') {
    reqUrl = [trimEnd(url), trimStart(id)].join('/');
    reqData = data;
  }

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

  const reqHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${base64Encode(String(allOptions.key))}`,
    ...(session ? { 'X-Session': session } : {}),
    ...(locale ? { 'X-Locale': locale } : {}),
    ...(currency ? { 'X-Currency': currency } : {}),
  };

  const response = await fetch(reqUrl, {
    method: reqMethod,
    headers: reqHeaders,
    body: reqBody,
    credentials: 'include',
    mode: 'cors',
  });
  const responseSession = response.headers.get('X-Session');

  if (typeof responseSession === 'string' && session !== responseSession) {
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

if (typeof window !== 'undefined') {
  window.swell = {
    version: '@VERSION@',
  };
}

module.exports = api;
