import cardApi from './card.mjs';
import { getCookie, setCookie } from './cookie.mjs';
import cacheApi from './cache.mjs';
import methods$3 from './cart.mjs';
import methods$4 from './account.mjs';
import methods$5 from './products.mjs';
import methods$6 from './categories.mjs';
import methods$7 from './attributes.mjs';
import methods$8 from './subscriptions.mjs';
import { d as defaultMethods, y as trimEnd, z as setOptions, A as utils, B as trimStart, C as trimBoth, t as toSnake, D as stringifyQuery, E as base64Encode, i as isServer, a as toCamel } from './index.a911a674.mjs';
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

function methods$2(api) {
  const { get, list } = defaultMethods(api, '/invoices', ['list', 'get']);
  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('invoices', id, () => get(id, ...args));
    },

    list,
  };
}

function methods$1(api, opt) {
  return {
    /**
     * Get the decoded session as an object of session values
     */
    get() {
      return api.request('get', '/session');
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

function methods(api, _opt) {
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
      return api.request(method, functionName, undefined, data, {
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

/**
 * Swell API client
 * @param {string} initStore - Store name
 * @param {string} initKey - API key
 * @param {InitOptions} initOptions - Options
 * @returns {SwellClient} API client
 */
function swell(initStore = undefined, initKey, initOptions = {}) {
  const options = {
    store: null,
    key: null,
    url: null,
    useCamelCase: null,
    previewContent: null,
  };

  const api = {};

  Object.assign(api, {
    version: '4.2.5',
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
      options.headers = opt.headers || {};

      setOptions(options);
    },

    // Backward compatibility
    auth(...args) {
      return this.init(...args);
    },

    get(url, query) {
      return api.request('get', url, query);
    },

    put(url, data) {
      return api.request('put', url, data);
    },

    post(url, data) {
      return api.request('post', url, data);
    },

    delete(url, data) {
      return api.request('delete', url, data);
    },

    cache: cacheApi,

    card: cardApi,

    cart: methods$3(api, options),

    account: methods$4(api),

    products: methods$5(api, options),

    categories: methods$6(api),

    attributes: methods$7(api),

    subscriptions: methods$8(api),

    invoices: methods$2(api),

    content: methods$9(api, options),

    settings: methods$a(api, options),

    payment: new PaymentController(api, options),

    locale: methods$b(api, options),

    currency: methods$c(api, options),

    session: methods$1(api, options),

    functions: methods(api),

    utils,
  });

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
      headers: {
        ...options.headers,
        ...(opt ? opt.headers : undefined),
      },
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
      ...(allOptions.headers || undefined),
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
      // Credentials and mode are only available in the browser
      ...(!isServer()
        ? {
            credentials: 'include',
            mode: 'cors',
          }
        : undefined),
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

  if (initStore) {
    api.init(initStore, initKey, initOptions);
  }

  return api;
}

const instance = swell();

instance.create = swell;

export { instance as default };
