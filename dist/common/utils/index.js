"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64Encode = exports.buildParams = exports.serializeData = exports.vaultRequestId = exports.vaultRequest = exports.defaultMethods = exports.isFunction = exports.isServer = exports.reduce = exports.map = exports.stringifyQuery = exports.trimEnd = exports.trimStart = exports.trimBoth = exports.keyToCamel = exports.keyToSnake = exports.toSnake = exports.toCamelPath = exports.toCamel = exports.isObject = exports.getOptions = exports.setOptions = exports.merge = void 0;
const qs_1 = __importDefault(require("qs"));
const lodash_1 = require("lodash");
const deepmerge_1 = __importDefault(require("deepmerge"));
const object_keys_normalizer_1 = require("object-keys-normalizer");
if (window) {
    window.__swell_vault_request_id = window.__swell_vault_request_id || {};
}
let options = {};
function merge(x, y, opt = {}) {
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
    return deepmerge_1.default(x, y, {
        arrayMerge,
    });
}
exports.merge = merge;
function setOptions(optns) {
    options = optns;
}
exports.setOptions = setOptions;
function getOptions() {
    return options;
}
exports.getOptions = getOptions;
function isObject(val) {
    return val && typeof val === 'object' && !(val instanceof Array);
}
exports.isObject = isObject;
function toCamel(obj) {
    if (!obj)
        return obj;
    const objCopy = JSON.parse(JSON.stringify(obj));
    return object_keys_normalizer_1.normalizeKeys(objCopy, keyToCamel);
}
exports.toCamel = toCamel;
function toCamelPath(str) {
    if (typeof str === 'string') {
        return str.split('.').map(lodash_1.camelCase).join('.');
    }
    return str;
}
exports.toCamelPath = toCamelPath;
function toSnake(obj) {
    if (!obj)
        return obj;
    const objCopy = JSON.parse(JSON.stringify(obj));
    return object_keys_normalizer_1.normalizeKeys(objCopy, keyToSnake);
}
exports.toSnake = toSnake;
function keyToSnake(key) {
    // Handle keys prefixed with $ or _
    return (key[0] === '$' ? '$' : '') + lodash_1.snakeCase(key).replace(/\_([0-9])/g, '$1');
}
exports.keyToSnake = keyToSnake;
function keyToCamel(key) {
    // Handle keys prefixed with $ or _
    return (key[0] === '$' ? '$' : '') + lodash_1.camelCase(key).replace(/\_([0-9])/g, '$1');
}
exports.keyToCamel = keyToCamel;
function trimBoth(str) {
    return trimStart(trimEnd(str));
}
exports.trimBoth = trimBoth;
function trimStart(str) {
    return typeof str === 'string' ? str.replace(/^[/]+/, '') : '';
}
exports.trimStart = trimStart;
function trimEnd(str) {
    return typeof str === 'string' ? str.replace(/[/]+$/, '') : '';
}
exports.trimEnd = trimEnd;
function stringifyQuery(str) {
    return qs_1.default.stringify(str, {
        depth: 10,
        encode: false,
    });
}
exports.stringifyQuery = stringifyQuery;
function map(arr, cb) {
    return arr instanceof Array ? arr.map(cb) : [];
}
exports.map = map;
function reduce(arr, cb, init) {
    return arr instanceof Array ? arr.reduce(cb, init) : init;
}
exports.reduce = reduce;
function isServer() {
    return !(typeof window !== 'undefined' && window && window.document);
}
exports.isServer = isServer;
function isFunction(func) {
    return typeof func === 'function';
}
exports.isFunction = isFunction;
function defaultMethods(request, uri, methods) {
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
exports.defaultMethods = defaultMethods;
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
exports.vaultRequest = vaultRequest;
function vaultRequestId() {
    if (window) {
        window.__swell_vault_request_id = window.__swell_vault_request_id || 0;
        window.__swell_vault_request_id++;
        return window.__swell_vault_request_id;
    }
    return null;
}
exports.vaultRequestId = vaultRequestId;
function serializeData(data) {
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
exports.serializeData = serializeData;
const rbracket = /\[\]$/;
function buildParams(key, obj, add) {
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
exports.buildParams = buildParams;
function base64Encode(string) {
    if (typeof btoa !== 'undefined') {
        return btoa(string);
    }
    return Buffer.from(string).toString('base64');
}
exports.base64Encode = base64Encode;
function v(key, v) {
    throw new Error('Function not implemented.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsNENBQW9CO0FBQ3BCLG1DQUE4QztBQUM5QywwREFBa0M7QUFDbEMsbUVBQXVEO0FBU3ZELElBQUksTUFBTSxFQUFFO0lBQ1YsTUFBTSxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsSUFBSSxFQUFFLENBQUM7Q0FDekU7QUFHRCxJQUFJLE9BQU8sR0FBWSxFQUV0QixDQUFBO0FBQ0QsU0FBZ0IsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUU7SUFDbEMsSUFBSSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUU7UUFDL0IsT0FBTyxDQUFDLENBQUM7S0FDVjtJQUNELElBQUksQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO1FBQy9CLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFFRCxTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQTBCO1FBQzVELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzdCLElBQUksT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssV0FBVyxFQUFFO2dCQUM3QyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsWUFBWSxDQUFDLDZCQUE2QixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNyRjtpQkFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDL0MsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQy9EO2lCQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdEMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN4QjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQUVELE9BQU8sbUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3JCLFVBQVU7S0FDWCxDQUFDLENBQUM7QUFDTCxDQUFDO0FBekJELHNCQXlCQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxLQUFLO0lBQzlCLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDbEIsQ0FBQztBQUZELGdDQUVDO0FBRUQsU0FBZ0IsVUFBVTtJQUN4QixPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRkQsZ0NBRUM7QUFFRCxTQUFnQixRQUFRLENBQUMsR0FBRztJQUMxQixPQUFPLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxLQUFLLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRkQsNEJBRUM7QUFFRCxTQUFnQixPQUFPLENBQUMsR0FBRztJQUN6QixJQUFJLENBQUMsR0FBRztRQUFFLE9BQU8sR0FBRyxDQUFDO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hELE9BQU8sc0NBQWEsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUpELDBCQUlDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLEdBQUc7SUFDN0IsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDM0IsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxrQkFBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2hEO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBTEQsa0NBS0M7QUFFRCxTQUFnQixPQUFPLENBQUMsR0FBRztJQUN6QixJQUFJLENBQUMsR0FBRztRQUFFLE9BQU8sR0FBRyxDQUFDO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hELE9BQU8sc0NBQWEsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUpELDBCQUlDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLEdBQUc7SUFDNUIsbUNBQW1DO0lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBSEQsZ0NBR0M7QUFFRCxTQUFnQixVQUFVLENBQUMsR0FBRztJQUM1QixtQ0FBbUM7SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFIRCxnQ0FHQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxHQUFHO0lBQzFCLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFGRCw0QkFFQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxHQUFHO0lBQzNCLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2pFLENBQUM7QUFGRCw4QkFFQztBQUVELFNBQWdCLE9BQU8sQ0FBQyxHQUFHO0lBQ3pCLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2pFLENBQUM7QUFGRCwwQkFFQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxHQUFHO0lBQ2hDLE9BQU8sWUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDdkIsS0FBSyxFQUFFLEVBQUU7UUFDVCxNQUFNLEVBQUUsS0FBSztLQUNkLENBQUMsQ0FBQztBQUNMLENBQUM7QUFMRCx3Q0FLQztBQUVELFNBQWdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUN6QixPQUFPLEdBQUcsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNqRCxDQUFDO0FBRkQsa0JBRUM7QUFFRCxTQUFnQixNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFJO0lBQ2xDLE9BQU8sR0FBRyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM1RCxDQUFDO0FBRkQsd0JBRUM7QUFFRCxTQUFnQixRQUFRO0lBQ3RCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZFLENBQUM7QUFGRCw0QkFFQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUFJO0lBQzdCLE9BQU8sT0FBTyxJQUFJLEtBQUssVUFBVSxDQUFDO0FBQ3BDLENBQUM7QUFGRCxnQ0FFQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE9BQU87SUFDbEQsT0FBTztRQUNMLElBQUksRUFDRixPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDMUIsQ0FBQyxDQUFDLFVBQVUsS0FBSztnQkFDYixPQUFPLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLFNBQVM7UUFFZixHQUFHLEVBQ0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLO2dCQUNqQixPQUFPLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLFNBQVM7S0FDaEIsQ0FBQztBQUNKLENBQUM7QUFoQkQsd0NBZ0JDO0FBRU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEdBQUcsU0FBUztJQUNuRSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQ2xDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDaEMsTUFBTSxTQUFTLEdBQUcsY0FBYyxFQUFFLENBQUM7SUFDbkMsTUFBTSxRQUFRLEdBQUcsd0JBQXdCLFNBQVMsRUFBRSxDQUFDO0lBRXJELElBQUksR0FBRztRQUNMLE1BQU0sRUFBRTtZQUNOLE1BQU07WUFDTixRQUFRO1NBQ1Q7UUFDRCxLQUFLLEVBQUUsSUFBSTtRQUNYLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRztLQUNsQixDQUFDO0lBRUYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFDaEMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFFN0UsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNuQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxFQUFFLDJCQUEyQixPQUFPLEdBQUcsSUFBSSxVQUFVO2dCQUMzRCxPQUFPLEVBQUUsR0FBRzthQUNiLENBQUMsQ0FBQztRQUNMLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQU1aLE1BQU0sVUFBVyxTQUFRLEtBQUs7U0FBRztRQUVqQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM1QixZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDM0IsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDM0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQyxHQUFHLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztnQkFDM0IsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDYjtpQkFBTSxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksR0FBRyxFQUFFO2dCQUMzQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO2dCQUNuRixHQUFHLENBQUMsSUFBSSxHQUFHLGtCQUFrQixDQUFDO2dCQUM5QixHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQzVCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNiO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEU7WUFDRCxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUM7UUFFRixRQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9ELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQXRERCxvQ0FzREM7QUFFRCxTQUFnQixjQUFjO0lBQzVCLElBQUksTUFBTSxFQUFFO1FBQ1YsTUFBTSxDQUFDLHdCQUF3QixHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLENBQUM7UUFDdkUsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDbEMsT0FBTyxNQUFNLENBQUMsd0JBQXdCLENBQUM7S0FDeEM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFQRCx3Q0FPQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFJO0lBQ2hDLElBQUksR0FBRyxDQUFDO0lBQ1IsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2IsTUFBTSxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUUsS0FBSztRQUM5Qix5REFBeUQ7UUFDekQsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVLEVBQUU7WUFDL0IsS0FBSyxHQUFHLEtBQUssRUFBRSxDQUFDO1NBQ2pCO2FBQU0sSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO1lBQ3hCLEtBQUssR0FBRyxFQUFFLENBQUM7U0FDWjtRQUNELENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFFLENBQUMsQ0FBQztJQUNGLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1FBQ3RCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ2xDO0lBQ0QsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQWhCRCxzQ0FnQkM7QUFFRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUM7QUFFekIsU0FBZ0IsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztJQUN2QyxJQUFJLElBQUksQ0FBQztJQUNULElBQUksR0FBRyxZQUFZLEtBQUssRUFBRTtRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLHFDQUFxQztnQkFDckMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNiO2lCQUFNO2dCQUNMLGtFQUFrRTtnQkFDbEUsV0FBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3RGO1NBQ0Y7S0FDRjtTQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtRQUN6Qyx5QkFBeUI7UUFDekIsS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFO1lBQ2hCLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3JEO0tBQ0Y7U0FBTTtRQUNMLHlCQUF5QjtRQUN6QixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ2Y7QUFDSCxDQUFDO0FBckJELGtDQXFCQztBQUVELFNBQWdCLFlBQVksQ0FBQyxNQUFNO0lBQ2pDLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1FBQy9CLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBTEQsb0NBS0M7QUFDRCxTQUFTLENBQUMsQ0FBQyxHQUFRLEVBQUUsQ0FBTTtJQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsQ0FBQyJ9