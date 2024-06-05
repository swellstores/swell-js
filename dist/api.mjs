import cardApi from './card.mjs';
import { getCookie, setCookie } from './cookie.mjs';
import cacheApi from './cache.mjs';
import methods$3 from './cart.mjs';
import methods$4 from './account.mjs';
import methods$5 from './products.mjs';
import methods$6 from './categories.mjs';
import methods$7 from './attributes.mjs';
import methods$8 from './subscriptions.mjs';
import { d as defaultMethods, y as trimEnd, z as utils, A as trimStart, B as trimBoth, t as toSnake, C as stringifyQuery, D as base64Encode, a as toCamel, E as setOptions } from './index.738bc14a.mjs';
import methods$9 from './content.mjs';
import methods$a from './settings.mjs';
import PaymentController from './payment.mjs';
import methods$b from './locale.mjs';
import methods$c from './currency.mjs';
import 'qs';
import './find.18f1ac6d.mjs';
import './round.577a8441.mjs';
import 'deepmerge';
import 'fast-case';

function methods$2(request) {
  const { get, list } = defaultMethods(request, '/invoices', ['list', 'get']);
  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('invoices', id, () => get(id, ...args));
    },

    list,
  };
}

function methods$1(request, opt) {
  return {
    /**
     * Get the decoded session as an object of session values
     */
    get() {
      return request('get', '/session');
    },

    /**
     * Get the encoded session cookie
     * This simplifies storing or passing the session to another system
     */
    getCookie() {
      return opt.getCookie('swell-session');
    },

    /**
     * Set the encoded session cookie
     * This simplifies restoring the session from another system
     */
    setCookie(value) {
      opt.setCookie('swell-session', value);
    },
  };
}

function methods(request, _opt) {
  return {
    /**
     * Make a request to an app function and greceiveet a response
     * @param {string} method
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    request(method, appId, functionName, data, options = undefined) {
      return request(method, functionName, undefined, data, {
        ...options,
        path: `/functions/${appId}`,
        useCamelCase: false, // avoid mutating data
      });
    },

    /**
     * Helper to make a GET request to an app function and receive a response
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    get(appId, functionName, data, options = undefined) {
      return this.request('get', appId, functionName, data, options);
    },

    /**
     * Helper to make a PUT request to an app function and receive a response
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    put(appId, functionName, data, options = undefined) {
      return this.request('put', appId, functionName, data, options);
    },

    /**
     * Helper to make a POST request to an app function and receive a response
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    post(appId, functionName, data, options = undefined) {
      return this.request('post', appId, functionName, data, options);
    },

    /**
     * Helper to make a DELETE request to an app function and receive a response
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    delete(appId, functionName, data, options = undefined) {
      return this.request('delete', appId, functionName, data, options);
    },
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
  version: '4.1.1',
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
    options.getCookie = opt.getCookie || getCookie;
    options.setCookie = opt.setCookie || setCookie;
    options.getCart = opt.getCart;
    options.updateCart = opt.updateCart;
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

  cart: methods$3(request, options),

  account: methods$4(request),

  products: methods$5(request, options),

  categories: methods$6(request),

  attributes: methods$7(request),

  subscriptions: methods$8(request),

  invoices: methods$2(request),

  content: methods$9(request, options),

  settings: methods$a(request, options),

  payment: new PaymentController(request, options),

  locale: methods$b(request, options),

  currency: methods$c(request, options),

  session: methods$1(request, options),

  functions: methods(request),

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

  const session = allOptions.session || allOptions.getCookie('swell-session');
  const locale = allOptions.locale || allOptions.getCookie('swell-locale');
  const currency =
    allOptions.currency || allOptions.getCookie('swell-currency');
  const path = allOptions.path || '/api';

  const baseUrl = `${allOptions.url}${allOptions.base || ''}${path}`;
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
    allOptions.setCookie('swell-session', responseSession);
  }

  // Response could be text, json, or empty
  let result = null;
  try {
    result = await response.text();
    try {
      result = JSON.parse(result);
    } catch (err) {
      // noop
    }
  } catch (err) {
    // noop
  }

  if (result && result.error) {
    const err = new Error(result.error.message || result.error);
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

  return allOptions.useCamelCase ? toCamel(result) : result;
}

export { api as default };
