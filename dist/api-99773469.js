import 'isomorphic-unfetch';
import { c as cardApi } from './card-3225c3a9.js';
import { g as getCookie, s as setCookie } from './cookie-8e91f8dd.js';
import { c as cacheApi } from './cache-f2b62a15.js';
import { m as methods } from './cart-0249dad3.js';
import { m as methods$1 } from './account-1c594341.js';
import { m as methods$2 } from './products-b9b703d9.js';
import { m as methods$3 } from './categories-efae21dd.js';
import { m as methods$4 } from './attributes-8d23dd28.js';
import { m as methods$5 } from './subscriptions-a38628b4.js';
import { m as methods$6 } from './content-82dc195e.js';
import { m as methods$7 } from './settings-3a746fb9.js';
import { m as methods$8 } from './payment-a1113b03.js';
import { m as methods$9 } from './locale-f2899567.js';
import { m as methods$a } from './currency-59a7db42.js';
import { f as trimEnd, u as utils, e as trimStart, c as trimBoth, b as toSnake, h as stringifyQuery, n as base64Encode, t as toCamel, s as setOptions } from './index-b1ee0b3d.js';

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
const options = {
  store: null,
  key: null,
  url: null,
  useCamelCase: null,
  previewContent: null
};
const api = {
  version: "3.18.0",
  options,
  request,
  init(store, key, opt = {}) {
    options.key = key;
    options.store = store;
    options.url = opt.url ? trimEnd(opt.url) : `https://${store}.swell.store`;
    options.vaultUrl = opt.vaultUrl ? trimEnd(opt.vaultUrl) : `https://vault.schema.io`;
    options.timeout = opt.timeout && parseInt(opt.timeout, 10) || 2e4;
    options.useCamelCase = opt.useCamelCase || false;
    options.previewContent = opt.previewContent || false;
    options.session = opt.session;
    options.locale = opt.locale;
    options.currency = opt.currency;
    options.api = api;
    setOptions(options);
  },
  auth(...args) {
    return this.init(...args);
  },
  get(url, query) {
    return request("get", url, query);
  },
  put(url, data) {
    return request("put", url, data);
  },
  post(url, data) {
    return request("post", url, data);
  },
  delete(url, data) {
    return request("delete", url, data);
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
  utils
};
async function request(method, url, id = void 0, data = void 0, opt = void 0) {
  const allOptions = __spreadValues(__spreadValues({}, options), opt);
  const session = allOptions.session || getCookie("swell-session");
  const locale2 = allOptions.locale || getCookie("swell-locale");
  const currency2 = allOptions.currency || getCookie("swell-currency");
  const baseUrl = `${allOptions.url}${allOptions.base || ""}/api`;
  const reqMethod = String(method).toLowerCase();
  let reqUrl = url;
  let reqData = id;
  if (data !== void 0 || typeof id === "string") {
    reqUrl = [trimEnd(url), trimStart(id)].join("/");
    reqData = data;
  }
  reqUrl = allOptions.fullUrl || `${baseUrl}/${trimBoth(reqUrl)}`;
  reqData = allOptions.useCamelCase ? toSnake(reqData) : reqData;
  let reqBody;
  if (reqMethod === "get") {
    let exQuery;
    [reqUrl, exQuery] = reqUrl.split("?");
    const fullQuery = [exQuery, stringifyQuery(reqData)].join("&").replace(/^&/, "");
    reqUrl = `${reqUrl}${fullQuery ? `?${fullQuery}` : ""}`;
  } else {
    reqBody = JSON.stringify(reqData);
  }
  const reqHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Basic ${base64Encode(String(allOptions.key))}`
  };
  if (session) {
    reqHeaders["X-Session"] = session;
  }
  if (locale2) {
    reqHeaders["X-Locale"] = locale2;
  }
  if (currency2) {
    reqHeaders["X-Currency"] = currency2;
  }
  const response = await fetch(reqUrl, {
    method: reqMethod,
    headers: reqHeaders,
    body: reqBody,
    credentials: "include",
    mode: "cors"
  });
  const responseSession = response.headers.get("X-Session");
  if (typeof responseSession === "string" && session !== responseSession) {
    setCookie("swell-session", responseSession);
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
      "A connection error occurred while making the request"
    );
    err.code = "connection_error";
    throw err;
  }
  return options.useCamelCase ? toCamel(result) : result;
}

export { api as a };
