import qs from 'qs';
import { camelCase, snakeCase } from 'lodash';
import deepmerge from 'deepmerge';
import { normalizeKeys } from 'object-keys-normalizer';
if (window) {
    window.__swell_vault_request_id = window.__swell_vault_request_id || {};
}
let options = {};
export function merge(x, y, opt = {}) {
    if (!y || typeof y !== 'object') {
        return x;
    }
    if (!x || typeof x !== 'object') {
        return x;
    }
    function arrayMerge(target, source, mergeOptions) {
        const destination = target.slice();
        source.forEach((item, index) => {
            if (typeof destination[index] === 'undefined') {
                destination[index] = mergeOptions.cloneUnlessOtherwiseSpecified(item, mergeOptions);
            }
            else if (mergeOptions.isMergeableObject(item)) {
                destination[index] = merge(target[index], item, mergeOptions);
            }
            else if (target.indexOf(item) === -1) {
                destination.push(item);
            }
        });
        return destination;
    }
    return deepmerge(x, y, {
        arrayMerge,
    });
}
export function setOptions(optns) {
    options = optns;
}
export function getOptions() {
    return options;
}
export function isObject(val) {
    return val && typeof val === 'object' && !(val instanceof Array);
}
export function toCamel(obj) {
    if (!obj)
        return obj;
    const objCopy = JSON.parse(JSON.stringify(obj));
    return normalizeKeys(objCopy, keyToCamel);
}
export function toCamelPath(str) {
    if (typeof str === 'string') {
        return str.split('.').map(camelCase).join('.');
    }
    return str;
}
export function toSnake(obj) {
    if (!obj)
        return obj;
    const objCopy = JSON.parse(JSON.stringify(obj));
    return normalizeKeys(objCopy, keyToSnake);
}
export function keyToSnake(key) {
    // Handle keys prefixed with $ or _
    return (key[0] === '$' ? '$' : '') + snakeCase(key).replace(/\_([0-9])/g, '$1');
}
export function keyToCamel(key) {
    // Handle keys prefixed with $ or _
    return (key[0] === '$' ? '$' : '') + camelCase(key).replace(/\_([0-9])/g, '$1');
}
export function trimBoth(str) {
    return trimStart(trimEnd(str));
}
export function trimStart(str) {
    return typeof str === 'string' ? str.replace(/^[/]+/, '') : '';
}
export function trimEnd(str) {
    return typeof str === 'string' ? str.replace(/[/]+$/, '') : '';
}
export function stringifyQuery(str) {
    return qs.stringify(str, {
        depth: 10,
        encode: false,
    });
}
export function map(arr, cb) {
    return arr instanceof Array ? arr.map(cb) : [];
}
export function reduce(arr, cb, init) {
    return arr instanceof Array ? arr.reduce(cb, init) : init;
}
export function isServer() {
    return !(typeof window !== 'undefined' && window && window.document);
}
export function isFunction(func) {
    return typeof func === 'function';
}
export function defaultMethods(request, uri, methods) {
    return {
        list: methods.indexOf('list') >= 0
            ? function (query) {
                return request('get', uri, undefined, query);
            }
            : undefined,
        get: methods.indexOf('get') >= 0
            ? function (id, query) {
                return request('get', uri, id, query);
            }
            : undefined,
    };
}
export async function vaultRequest(method, url, data, opt = undefined) {
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
        script.src = `${trimEnd(vaultUrl)}/${trimStart(url)}?${serializeData(data)}`;
        const errorTimeout = setTimeout(() => {
            window[callback]({
                $error: `Request timed out after ${timeout / 1000} seconds`,
                $status: 500,
            });
        }, timeout);
        class SwellError extends Error {
        }
        window[callback] = (result) => {
            clearTimeout(errorTimeout);
            if (result && result.$error) {
                const err = new SwellError(result.$error);
                err.code = 'request_error';
                err.status = result.$status;
                reject(err);
            }
            else if (!result || result.$status >= 300) {
                const err = new SwellError('A connection error occurred while making the request');
                err.code = 'connection_error';
                err.status = result.$status;
                reject(err);
            }
            else {
                resolve(options.useCamelCase ? toCamel(result.$data) : result.$data);
            }
            delete window[callback];
            script.parentNode.removeChild(script);
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    });
}
export function vaultRequestId() {
    if (window) {
        window.__swell_vault_request_id = window.__swell_vault_request_id || 0;
        window.__swell_vault_request_id++;
        return window.__swell_vault_request_id;
    }
    return null;
}
export function serializeData(data) {
    let key;
    const s = [];
    const add = function (key, value) {
        // If value is a function, invoke it and return its value
        if (typeof value === 'function') {
            value = value();
        }
        else if (value == null) {
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
export function buildParams(key, obj, add) {
    let name;
    if (obj instanceof Array) {
        for (let i = 0; i < obj.length; i++) {
            if (rbracket.test(key)) {
                // Treat each array item as a scalar.
                add(key, v);
            }
            else {
                // Item is non-scalar (array or object), encode its numeric index.
                buildParams(key + '[' + (typeof v === 'object' && v != null ? i : '') + ']', v, add);
            }
        }
    }
    else if (obj && typeof obj === 'object') {
        // Serialize object item.
        for (name in obj) {
            buildParams(key + '[' + name + ']', obj[name], add);
        }
    }
    else {
        // Serialize scalar item.
        add(key, obj);
    }
}
export function base64Encode(string) {
    if (typeof btoa !== 'undefined') {
        return btoa(string);
    }
    return Buffer.from(string).toString('base64');
}
function v(key, v) {
    throw new Error('Function not implemented.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3BCLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQzlDLE9BQU8sU0FBUyxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFTdkQsSUFBSSxNQUFNLEVBQUU7SUFDVixNQUFNLENBQUMsd0JBQXdCLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixJQUFJLEVBQUUsQ0FBQztDQUN6RTtBQUdELElBQUksT0FBTyxHQUFZLEVBRXRCLENBQUE7QUFDRCxNQUFNLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUU7SUFDbEMsSUFBSSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUU7UUFDL0IsT0FBTyxDQUFDLENBQUM7S0FDVjtJQUNELElBQUksQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO1FBQy9CLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFFRCxTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQTBCO1FBQzVELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzdCLElBQUksT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssV0FBVyxFQUFFO2dCQUM3QyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsWUFBWSxDQUFDLDZCQUE2QixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNyRjtpQkFBTSxJQUFJLFlBQVksQ0FB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