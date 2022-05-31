import { stringify } from 'qs';
import set from 'lodash/set';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import find from 'lodash/find';
import round from 'lodash/round';
import findIndex from 'lodash/findIndex';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import deepmerge from 'deepmerge';
import { normalizeKeys } from 'object-keys-normalizer';

let options = {};

function merge(x, y, opt = {}) {
  if (!y || typeof y !== 'object') {
    return x;
  }
  if (!x || typeof x !== 'object') {
    return x;
  }
  function arrayMerge(target, source, options) {
    const destination = target.slice();
    source.forEach((item, index) => {
      if (typeof destination[index] === 'undefined') {
        destination[index] = options.cloneUnlessOtherwiseSpecified(
          item,
          options,
        );
      } else if (options.isMergeableObject(item)) {
        destination[index] = merge(target[index], item, options);
      } else if (target.indexOf(item) === -1) {
        destination.push(item);
      }
    });
    return destination;
  }
  return deepmerge(x, y, {
    arrayMerge,
  });
}

function setOptions(optns) {
  options = optns;
}

function getOptions() {
  return options;
}

function isObject(val) {
  return val && typeof val === 'object' && !(val instanceof Array);
}

function toCamel(obj) {
  if (!obj) return obj;
  const objCopy = JSON.parse(JSON.stringify(obj));
  return normalizeKeys(objCopy, keyToCamel);
}

function toCamelPath(str) {
  if (typeof str === 'string') {
    return str.split('.').map(camelCase).join('.');
  }
  return str;
}

function toSnake(obj) {
  if (!obj) return obj;
  const objCopy = JSON.parse(JSON.stringify(obj));
  return normalizeKeys(objCopy, keyToSnake);
}

function keyToSnake(key) {
  // Handle keys prefixed with $ or _
  return (
    (key[0] === '$' ? '$' : '') + snakeCase(key).replace(/\_([0-9])/g, '$1')
  );
}

function keyToCamel(key) {
  // Handle keys prefixed with $ or _
  return (
    (key[0] === '$' ? '$' : '') + camelCase(key).replace(/\_([0-9])/g, '$1')
  );
}

function trimBoth(str) {
  return trimStart(trimEnd(str));
}

function trimStart(str) {
  return typeof str === 'string' ? str.replace(/^[/]+/, '') : '';
}

function trimEnd(str) {
  return typeof str === 'string' ? str.replace(/[/]+$/, '') : '';
}

function stringifyQuery(str) {
  return stringify(str);
}

function map(arr, cb) {
  return arr instanceof Array ? arr.map(cb) : [];
}

function reduce(arr, cb, init) {
  return arr instanceof Array ? arr.reduce(cb, init) : init;
}

function isServer() {
  return !(typeof window !== 'undefined' && window && window.document);
}

function isFunction(func) {
  return typeof func === 'function';
}

function defaultMethods(request, uri, methods) {
  return {
    list:
      methods.indexOf('list') >= 0
        ? function (query) {
            return request('get', uri, undefined, query);
          }
        : undefined,

    get:
      methods.indexOf('get') >= 0
        ? function (id, query) {
            return request('get', uri, id, query);
          }
        : undefined,
  };
}

async function vaultRequest(method, url, data, opt = undefined) {
  const vaultUrl = options.vaultUrl;
  const timeout = options.timeout;
  const requestId = vaultRequestId();
  const callback = `swell_vault_response_${requestId}`;

  data = {
    $jsonp: {
      method,
      callback,
    },
    $data: data,
    $key: options.key,
  };

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `${trimEnd(vaultUrl)}/${trimStart(url)}?${serializeData(
      data,
    )}`;

    const errorTimeout = setTimeout(() => {
      window[callback]({
        $error: `Request timed out after ${timeout / 1000} seconds`,
        $status: 500,
      });
    }, timeout);

    window[callback] = (result) => {
      clearTimeout(errorTimeout);
      if (result && result.$error) {
        const err = new Error(result.$error);
        err.code = 'request_error';
        err.status = result.$status;
        reject(err);
      } else if (!result || result.$status >= 300) {
        const err = new Error(
          'A connection error occurred while making the request',
        );
        err.code = 'connection_error';
        err.status = result.$status;
        reject(err);
      } else {
        resolve(options.useCamelCase ? toCamel(result.$data) : result.$data);
      }
      delete window[callback];
      script.parentNode.removeChild(script);
    };

    document.getElementsByTagName('head')[0].appendChild(script);
  });
}

function vaultRequestId() {
  window.__swell_vault_request_id = window.__swell_vault_request_id || 0;
  window.__swell_vault_request_id++;
  return window.__swell_vault_request_id;
}

function serializeData(data) {
  const s = [];
  const add = function (key, value) {
    // If value is a function, invoke it and return its value
    if (typeof value === 'function') {
      value = value();
    } else if (value == null) {
      value = '';
    }
    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  };
  for (const key in data) {
    buildParams(key, data[key], add);
  }
  return s.join('&').replace(' ', '+');
}
const rbracket = /\[\]$/;
function buildParams(key, obj, add) {
  let name;
  if (obj instanceof Array) {
    for (let i = 0; i < obj.length; i++) {
      if (rbracket.test(key)) {
        // Treat each array item as a scalar.
        add(key, v);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(
          key + '[' + (typeof v === 'object' && v != null ? i : '') + ']',
          v,
          add,
        );
      }
    }
  } else if (obj && typeof obj === 'object') {
    // Serialize object item.
    for (name in obj) {
      buildParams(key + '[' + name + ']', obj[name], add);
    }
  } else {
    // Serialize scalar item.
    add(key, obj);
  }
}

function base64Encode(string) {
  if (typeof btoa !== 'undefined') {
    return btoa(string);
  }
  return Buffer.from(string).toString('base64');
}

function getLocationParams(location) {
  const url = location.search;
  const query = url.substr(1);
  const result = {};
  query.split('&').forEach(function (part) {
    const item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

function removeUrlParams() {
  const url = window.location.origin + window.location.pathname;
  window.history.pushState({ path: url }, '', url);
}

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  defaultMethods: defaultMethods,
  set: set,
  get: get,
  uniq: uniq,
  find: find,
  round: round,
  findIndex: findIndex,
  camelCase: camelCase,
  cloneDeep: cloneDeep,
  merge: merge,
  setOptions: setOptions,
  getOptions: getOptions,
  toCamel: toCamel,
  toCamelPath: toCamelPath,
  toSnake: toSnake,
  trimBoth: trimBoth,
  trimStart: trimStart,
  trimEnd: trimEnd,
  stringifyQuery: stringifyQuery,
  isServer: isServer,
  isFunction: isFunction,
  isObject: isObject,
  isEqual: isEqual,
  snakeCase: snakeCase,
  map: map,
  reduce: reduce,
  base64Encode: base64Encode,
  vaultRequest: vaultRequest,
  getLocationParams: getLocationParams,
  removeUrlParams: removeUrlParams
});

export { toCamelPath as a, toSnake as b, trimBoth as c, defaultMethods as d, trimStart as e, trimEnd as f, getOptions as g, stringifyQuery as h, isServer as i, isFunction as j, isObject as k, map as l, merge as m, base64Encode as n, getLocationParams as o, removeUrlParams as p, index as q, reduce as r, setOptions as s, toCamel as t, vaultRequest as v };
