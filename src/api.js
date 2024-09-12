import card from './card';
import { getCookie, setCookie } from './cookie';
import cache from './cache';
import cart from './cart';
import account from './account';
import products from './products';
import categories from './categories';
import attributes from './attributes';
import subscriptions from './subscriptions';
import invoices from './invoices';
import content from './content';
import settings from './settings';
import session from './session';
import Payment from './payment';
import locale from './locale';
import currency from './currency';
import functions from './functions';
import * as utils from './utils';

/**
 * Swell API client
 * @param {string} initStore - Store name
 * @param {string} initKey - API key
 * @param {InitOptions} initOptions - Options
 * @returns {swell} API client
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
    version: '__VERSION__',
    options,
    request,

    init(store, key, opt = {}) {
      options.key = key;
      options.store = store;
      options.url = opt.url
        ? utils.trimEnd(opt.url)
        : `https://${store}.swell.store`;
      options.vaultUrl = opt.vaultUrl
        ? utils.trimEnd(opt.vaultUrl)
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
      utils.setOptions(options);
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

    cache,

    card,

    cart: cart(api, options),

    account: account(api, options),

    products: products(api, options),

    categories: categories(api, options),

    attributes: attributes(api, options),

    subscriptions: subscriptions(api, options),

    invoices: invoices(api, options),

    content: content(api, options),

    settings: settings(api, options),

    payment: new Payment(api, options),

    locale: locale(api, options),

    currency: currency(api, options),

    session: session(api, options),

    functions: functions(api, options),

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
      reqUrl = [utils.trimEnd(url), utils.trimStart(id)].join('/');
      reqData = data;
    }

    reqUrl = allOptions.fullUrl || `${baseUrl}/${utils.trimBoth(reqUrl)}`;
    reqData = allOptions.useCamelCase ? utils.toSnake(reqData) : reqData;

    let reqBody;
    if (reqMethod === 'get') {
      let exQuery;
      [reqUrl, exQuery] = reqUrl.split('?');
      const fullQuery = [exQuery, utils.stringifyQuery(reqData)]
        .join('&')
        .replace(/^&/, '');
      reqUrl = `${reqUrl}${fullQuery ? `?${fullQuery}` : ''}`;
    } else {
      reqBody = JSON.stringify(reqData);
    }

    const reqHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${utils.base64Encode(String(allOptions.key))}`,
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
      ...(!utils.isServer()
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

    return allOptions.useCamelCase ? utils.toCamel(result) : result;
  }

  if (initStore) {
    api.init(initStore, initKey, initOptions);
  }

  return api;
}

const instance = swell();

instance.create = swell;

export default instance;
