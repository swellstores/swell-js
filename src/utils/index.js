import { stringify } from 'qs';
import set from 'lodash-es/set';
import get from 'lodash-es/get';
import uniq from 'lodash-es/uniq';
import find from 'lodash-es/find';
import round from 'lodash-es/round';
import pick from 'lodash-es/pick';
import findIndex from 'lodash-es/findIndex';
import cloneDeep from 'lodash-es/cloneDeep';
import toNumber from 'lodash-es/toNumber';
import toLower from 'lodash-es/toLower';
import isEqual from 'lodash-es/isEqual';
import isEmpty from 'lodash-es/isEmpty';
import deepmerge from 'deepmerge';
import { camelize, decamelize, camelizeKeys, decamelizeKeys } from 'fast-case';

/* global Buffer */

const LOADING_SCRIPTS = {};

let options = {};

function arrayMerge(target, source, options) {
  const destination = target.slice();
  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
}

/**
 * @template T
 * @param {Partial<T>} x
 * @param {Partial<T>} y
 * @param {deepmerge.Options} [opt]
 * @returns {T}
 */
function merge(x, y, opt) {
  if (!y || typeof y !== 'object') {
    return x;
  }

  if (!x || typeof x !== 'object') {
    return x;
  }

  if (!opt) {
    opt = { arrayMerge };
  }

  return deepmerge(x, y, opt);
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

function camelCase(str) {
  return camelize(str);
}

function snakeCase(str) {
  return decamelize(str, '_');
}

function toCamel(obj) {
  if (!obj) return obj;
  const objCopy = JSON.parse(JSON.stringify(obj));
  return camelizeKeys(objCopy);
}

function toCamelPath(str) {
  if (typeof str === 'string') {
    return str.split('.').map(camelize).join('.');
  }
  return str;
}

function toSnake(obj) {
  if (!obj) return obj;
  const objCopy = JSON.parse(JSON.stringify(obj));
  return decamelizeKeys(objCopy, '_');
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
  return !(typeof window !== 'undefined' && window?.document);
}

function isFunction(func) {
  return typeof func === 'function';
}

function defaultMethods(api, uri, methods) {
  return {
    list:
      methods.indexOf('list') >= 0
        ? function (query) {
            return api.request('get', uri, undefined, query);
          }
        : undefined,

    get:
      methods.indexOf('get') >= 0
        ? function (id, query) {
            return api.request('get', uri, id, query);
          }
        : undefined,
  };
}

async function vaultRequest(method, url, data) {
  const { vaultUrl, timeout, key } = options;
  const requestData = {
    $jsonp: {
      method,
      callback: 'none',
    },
    $data: data,
    $key: key,
  };
  const requestUrl = `${trimEnd(vaultUrl)}/${trimStart(url)}?${serializeData(
    requestData,
  )}`;

  const abortController = new AbortController();
  const id = setTimeout(() => abortController.abort(), timeout);

  const result = await fetch(requestUrl, {
    signal: abortController.signal,
  })
    .then((response) => response.json())
    .catch((error) => {
      if (error.name === 'AbortError') {
        const timeoutError = new Error(
          `Request timed out after ${timeout / 1000} seconds`,
        );

        timeoutError.status = 500;

        throw timeoutError;
      }

      throw new Error(error.message);
    });

  clearTimeout(id);

  if (result?.$error) {
    const requestError = new Error(result.$error);

    requestError.code = 'request_error';
    requestError.status = result.$status;

    throw requestError;
  } else if (!result || result.$status >= 300) {
    const connectionError = new Error(
      'A connection error occurred while making the request',
    );

    connectionError.code = 'connection_error';
    connectionError.status = result?.$status;

    throw connectionError;
  }

  return result.$data;
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
      const value = obj[i];

      if (rbracket.test(key)) {
        // Treat each array item as a scalar.
        add(key, value);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(
          key +
            '[' +
            (typeof value === 'object' && value != null ? i : '') +
            ']',
          value,
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

async function loadScript(id, src, attributes = {}) {
  LOADING_SCRIPTS[id] =
    LOADING_SCRIPTS[id] ||
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.type = 'text/javascript';
      for (const [key, value] of Object.entries(attributes)) {
        script.setAttribute(key, value);
      }
      script.addEventListener(
        'load',
        () => {
          resolve();
          LOADING_SCRIPTS[id] = null;
        },
        {
          once: true,
        },
      );
      document.head.appendChild(script);
    });
  return LOADING_SCRIPTS[id];
}

function isLiveMode(mode) {
  return mode !== 'test';
}

export {
  defaultMethods,
  set,
  get,
  uniq,
  find,
  round,
  pick,
  findIndex,
  camelCase,
  cloneDeep,
  merge,
  setOptions,
  getOptions,
  toCamel,
  toCamelPath,
  toSnake,
  trimBoth,
  trimStart,
  trimEnd,
  stringifyQuery,
  isServer,
  isFunction,
  isObject,
  toNumber,
  toLower,
  isEqual,
  isEmpty,
  snakeCase,
  map,
  reduce,
  base64Encode,
  vaultRequest,
  getLocationParams,
  removeUrlParams,
  loadScript,
  isLiveMode,
};
