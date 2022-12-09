import { c as cardApi } from './card-2f5f9866.js';
import { g as getCookie, s as setCookie } from './cookie-ae3f44a7.js';
import { f as trimEnd, e as trimStart, c as trimBoth, b as toSnake, h as stringifyQuery, n as base64Encode, t as toCamel, s as setOptions } from './index-bce8d606.js';
import { c as cacheApi } from './cache-54abc38e.js';
import { m as methods } from './cart-21650912.js';
import { m as methods$1 } from './account-328cc590.js';
import { m as methods$2 } from './products-baf505e7.js';
import { m as methods$3 } from './categories-e52bebe3.js';
import { m as methods$4 } from './attributes-db35134e.js';
import { m as methods$5 } from './subscriptions-0e44e99f.js';
import { m as methods$6 } from './content-eb42ecce.js';
import { m as methods$7 } from './settings-b1a4a4af.js';
import { m as methods$8 } from './payment-dc6ea1a4.js';
import { m as methods$9 } from './locale-bd31bf45.js';
import { m as methods$a } from './currency-0ff55be3.js';
import 'isomorphic-unfetch';

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

  cart: methods(request, options),

  account: methods$1(request),

  products: methods$2(request, options),

  categories: methods$3(request),

  attributes: methods$4(request),

  subscriptions: methods$5(request),

  content: methods$6(request, options),

  settings: methods$7(request, options),

  payment: methods$8(request, options),

  locale: methods$9(request, options),

  currency: methods$a(request, options),
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

if (typeof window !== 'undefined') {
  window.swell = {
    version: '@VERSION@',
  };
}

export { api as a };
