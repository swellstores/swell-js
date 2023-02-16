import { c as cardApi } from './card-31d20d88.js';
import { g as getCookie, s as setCookie } from './cookie-dff5d694.js';
import { c as cacheApi } from './cache-70cd9241.js';
import { m as methods$1 } from './cart-fe0aca95.js';
import { m as methods$2 } from './account-328cc590.js';
import { m as methods$3 } from './products-9a198f48.js';
import { m as methods$4 } from './categories-bb6f6179.js';
import { m as methods$5 } from './attributes-a5d59cae.js';
import { m as methods$6 } from './subscriptions-5d5db711.js';
import { d as defaultMethods, n as trimEnd, E as utils, l as trimStart, k as trimBoth, j as toSnake, o as stringifyQuery, A as base64Encode, t as toCamel, e as setOptions } from './index-bee7164f.js';
import { m as methods$7 } from './content-8feae575.js';
import { m as methods$8 } from './settings-3cf85d69.js';
import { m as methods$9 } from './payment-491338ef.js';
import { m as methods$a } from './locale-abdc14e0.js';
import { m as methods$b } from './currency-85151e0d.js';

function methods(request) {
  const { get, list } = defaultMethods(request, '/invoices', ['list', 'get']);
  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('invoices', id, () => get(id, ...args));
    },

    list,
  };
}

const options = {
  store: null,
  key: null,
  url: null,
  useCamelCase: null,
  previewContent: null,
};

const api = {
  version: '3.19.10',
  options,
  request,

  init(store, key, opt = {}) {
    options.key = key;
    options.store = store;
    options.url = opt.url
      ? trimEnd(opt.url)
      : `https://${store}.swell.store`;
    options.vaultUrl = opt.vaultUrl
      ? trimEnd(opt.vaultUrl)
      : `https://vault.schema.io`;
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

  cache: cacheApi,

  card: cardApi,

  cart: methods$1(request, options),

  account: methods$2(request),

  products: methods$3(request, options),

  categories: methods$4(request),

  attributes: methods$5(request),

  subscriptions: methods$6(request),

  invoices: methods(request),

  content: methods$7(request, options),

  settings: methods$8(request, options),

  payment: methods$9(request, options),

  locale: methods$a(request, options),

  currency: methods$b(request, options),

  utils,
};

async function request(
  method,
  url,
  id = undefined,
  data = undefined,
  opt = undefined,
) {
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
    const fullQuery = [exQuery, stringifyQuery(reqData)]
      .join('&')
      .replace(/^&/, '');
    reqUrl = `${reqUrl}${fullQuery ? `?${fullQuery}` : ''}`;
  } else {
    reqBody = JSON.stringify(reqData);
  }

  const reqHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Basic ${base64Encode(String(allOptions.key))}`,
  };

  if (session) {
    reqHeaders['X-Session'] = session;
  }

  if (locale) {
    reqHeaders['X-Locale'] = locale;
  }

  if (currency) {
    reqHeaders['X-Currency'] = currency;
  }

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
    const err = new Error(
      'A connection error occurred while making the request',
    );
    err.code = 'connection_error';
    throw err;
  }

  return options.useCamelCase ? toCamel(result) : result;
}

export { api as a };
