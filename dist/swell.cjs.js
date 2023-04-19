'use strict';

var qs = require('qs');
var deepmerge = require('deepmerge');
var fastCase = require('fast-case');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var deepmerge__default = /*#__PURE__*/_interopDefaultLegacy(deepmerge);

var global$1 = (typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self :
  typeof window !== "undefined" ? window : {});

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global$1 == 'object' && global$1 && global$1.Object === Object && global$1;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used for built-in method references. */
var objectProto$f = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$c = objectProto$f.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$f.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$c.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$e = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$e.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$1(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag$2 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$1(value) {
  if (!isObject$1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
}

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/** Used for built-in method references. */
var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto$d = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$b = objectProto$d.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty$b).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject$1(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/** Used for built-in method references. */
var objectProto$c = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$a = objectProto$c.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$a.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var symbolTag$3 = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag$3);
}

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$b = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? undefined : result;
  }
  return hasOwnProperty$9.call(data, key) ? data[key] : undefined;
}

/** Used for built-in method references. */
var objectProto$a = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$8.call(data, key);
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/** Used as references for various `Number` constants. */
var INFINITY$3 = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto$2 = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto$2 ? symbolProto$2.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$3) ? '-0' : result;
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/** Used as references for various `Number` constants. */
var INFINITY$2 = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
}

/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!isObject$1(object)) {
    return object;
  }
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = toKey(path[index]),
        newValue = value;

    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return object;
    }

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject$1(objValue)
          ? objValue
          : (isIndex(path[index + 1]) ? [] : {});
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created. Arrays are created for missing index properties while objects
 * are created for all other missing properties. Use `_.setWith` to customize
 * `path` creation.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.set(object, 'a[0].b.c', 4);
 * console.log(object.a[0].b.c);
 * // => 4
 *
 * _.set(object, ['x', '0', 'y', 'z'], 5);
 * console.log(object.x[0].y.z);
 * // => 5
 */
function set(object, path, value) {
  return object == null ? object : baseSet(object, path, value);
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY$1) ? noop : function(values) {
  return new Set(values);
};

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE$1 = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE$1) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each element
 * is kept. The order of result values is determined by the order they occur
 * in the array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function uniq(array) {
  return (array && array.length) ? baseUniq(array) : [];
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$5 = 1,
    COMPARE_UNORDERED_FLAG$3 = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Check that cyclic values are equal.
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG$3) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$4 = 1,
    COMPARE_UNORDERED_FLAG$2 = 2;

/** `Object#toString` result references. */
var boolTag$3 = '[object Boolean]',
    dateTag$3 = '[object Date]',
    errorTag$2 = '[object Error]',
    mapTag$6 = '[object Map]',
    numberTag$3 = '[object Number]',
    regexpTag$3 = '[object RegExp]',
    setTag$6 = '[object Set]',
    stringTag$3 = '[object String]',
    symbolTag$2 = '[object Symbol]';

var arrayBufferTag$3 = '[object ArrayBuffer]',
    dataViewTag$4 = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = Symbol ? Symbol.prototype : undefined,
    symbolValueOf$1 = symbolProto$1 ? symbolProto$1.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$4:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag$3:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag$3:
    case dateTag$3:
    case numberTag$3:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag$2:
      return object.name == other.name && object.message == other.message;

    case regexpTag$3:
    case stringTag$3:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag$6:
      var convert = mapToArray;

    case setTag$6:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag$2:
      if (symbolValueOf$1) {
        return symbolValueOf$1.call(object) == symbolValueOf$1.call(other);
      }
  }
  return false;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$9.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols$1 ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols$1(object), function(symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/** `Object#toString` result references. */
var argsTag$3 = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$3;
}

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$8.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$7.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;

/** Built-in value references. */
var Buffer$2 = moduleExports$2 ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer$2 ? Buffer$2.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]',
    arrayTag$2 = '[object Array]',
    boolTag$2 = '[object Boolean]',
    dateTag$2 = '[object Date]',
    errorTag$1 = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag$5 = '[object Map]',
    numberTag$2 = '[object Number]',
    objectTag$3 = '[object Object]',
    regexpTag$2 = '[object RegExp]',
    setTag$5 = '[object Set]',
    stringTag$2 = '[object String]',
    weakMapTag$2 = '[object WeakMap]';

var arrayBufferTag$2 = '[object ArrayBuffer]',
    dataViewTag$3 = '[object DataView]',
    float32Tag$2 = '[object Float32Array]',
    float64Tag$2 = '[object Float64Array]',
    int8Tag$2 = '[object Int8Array]',
    int16Tag$2 = '[object Int16Array]',
    int32Tag$2 = '[object Int32Array]',
    uint8Tag$2 = '[object Uint8Array]',
    uint8ClampedTag$2 = '[object Uint8ClampedArray]',
    uint16Tag$2 = '[object Uint16Array]',
    uint32Tag$2 = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
typedArrayTags[uint32Tag$2] = true;
typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] =
typedArrayTags[arrayBufferTag$2] = typedArrayTags[boolTag$2] =
typedArrayTags[dataViewTag$3] = typedArrayTags[dateTag$2] =
typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag$5] = typedArrayTags[numberTag$2] =
typedArrayTags[objectTag$3] = typedArrayTags[regexpTag$2] =
typedArrayTags[setTag$5] = typedArrayTags[stringTag$2] =
typedArrayTags[weakMapTag$2] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$6.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$6;

  return value === proto;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$5.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction$1(value);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$4.call(other, key))) {
      return false;
    }
  }
  // Check that cyclic values are equal.
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

/* Built-in method references that are verified to be native. */
var Promise$1 = getNative(root, 'Promise');

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

/** `Object#toString` result references. */
var mapTag$4 = '[object Map]',
    objectTag$2 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$4 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';

var dataViewTag$2 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise$1),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
    (Map && getTag(new Map) != mapTag$4) ||
    (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag$4) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag$1)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag$2 ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$2;
        case mapCtorString: return mapTag$4;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$4;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var getTag$1 = getTag;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    objectTag$1 = '[object Object]';

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag$1 : getTag$1(object),
      othTag = othIsArr ? arrayTag$1 : getTag$1(other);

  objTag = objTag == argsTag$1 ? objectTag$1 : objTag;
  othTag = othTag == argsTag$1 ? objectTag$1 : othTag;

  var objIsObj = objTag == objectTag$1,
      othIsObj = othTag == objectTag$1,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty$3.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$3.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$1 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject$1(value);
}

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} findIndexFunc The function to find the collection index.
 * @returns {Function} Returns the new find function.
 */
function createFind(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!isArrayLike(collection)) {
      var iteratee = baseIteratee(predicate);
      collection = keys(collection);
      predicate = function(key) { return iteratee(iterable[key], key, iterable); };
    }
    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
  };
}

/** Used to match a single whitespace character. */
var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject$1(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$1(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax$1 = Math.max;

/**
 * This method is like `_.find` except that it returns the index of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @static
 * @memberOf _
 * @since 1.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the found element, else `-1`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': false },
 *   { 'user': 'pebbles', 'active': true }
 * ];
 *
 * _.findIndex(users, function(o) { return o.user == 'barney'; });
 * // => 0
 *
 * // The `_.matches` iteratee shorthand.
 * _.findIndex(users, { 'user': 'fred', 'active': false });
 * // => 1
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.findIndex(users, ['active', false]);
 * // => 0
 *
 * // The `_.property` iteratee shorthand.
 * _.findIndex(users, 'active');
 * // => 2
 */
function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax$1(length + index, 0);
  }
  return baseFindIndex(array, baseIteratee(predicate), index);
}

/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.find(users, function(o) { return o.age < 40; });
 * // => object for 'barney'
 *
 * // The `_.matches` iteratee shorthand.
 * _.find(users, { 'age': 1, 'active': true });
 * // => object for 'pebbles'
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.find(users, ['active', false]);
 * // => object for 'fred'
 *
 * // The `_.property` iteratee shorthand.
 * _.find(users, 'active');
 * // => object for 'barney'
 */
var find = createFind(findIndex);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsFinite = root.isFinite,
    nativeMin = Math.min;

/**
 * Creates a function like `_.round`.
 *
 * @private
 * @param {string} methodName The name of the `Math` method to use when rounding.
 * @returns {Function} Returns the new round function.
 */
function createRound(methodName) {
  var func = Math[methodName];
  return function(number, precision) {
    number = toNumber(number);
    precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
    if (precision && nativeIsFinite(number)) {
      // Shift with exponential notation to avoid floating-point issues.
      // See [MDN](https://mdn.io/round#Examples) for more details.
      var pair = (toString(number) + 'e').split('e'),
          value = func(pair[0] + 'e' + (+pair[1] + precision));

      pair = (toString(value) + 'e').split('e');
      return +(pair[0] + 'e' + (+pair[1] - precision));
    }
    return func(number);
  };
}

/**
 * Computes `number` rounded to `precision`.
 *
 * @static
 * @memberOf _
 * @since 3.10.0
 * @category Math
 * @param {number} number The number to round.
 * @param {number} [precision=0] The precision to round to.
 * @returns {number} Returns the rounded number.
 * @example
 *
 * _.round(4.006);
 * // => 4
 *
 * _.round(4.006, 2);
 * // => 4.01
 *
 * _.round(4060, -2);
 * // => 4100
 */
var round = createRound('round');

/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = baseGet(object, path);

    if (predicate(value, path)) {
      baseSet(result, castPath(path, object), value);
    }
  }
  return result;
}

/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, paths) {
  return basePickBy(object, paths, function(value, path) {
    return hasIn(object, path);
  });
}

/** Built-in value references. */
var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

/**
 * A specialized version of `baseRest` which flattens the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */
function flatRest(func) {
  return setToString(overRest(func, undefined, flatten), func + '');
}

/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */
var pick = flatRest(function(object, paths) {
  return object == null ? {} : basePick(object, paths);
});

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject$1(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$2.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer$1 = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer$1 ? Buffer$1.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty$1.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/** `Object#toString` result references. */
var boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    mapTag$3 = '[object Map]',
    numberTag$1 = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$3 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag$1 = '[object Symbol]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
    float32Tag$1 = '[object Float32Array]',
    float64Tag$1 = '[object Float64Array]',
    int8Tag$1 = '[object Int8Array]',
    int16Tag$1 = '[object Int16Array]',
    int32Tag$1 = '[object Int32Array]',
    uint8Tag$1 = '[object Uint8Array]',
    uint8ClampedTag$1 = '[object Uint8ClampedArray]',
    uint16Tag$1 = '[object Uint16Array]',
    uint32Tag$1 = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$1:
      return cloneArrayBuffer(object);

    case boolTag$1:
    case dateTag$1:
      return new Ctor(+object);

    case dataViewTag$1:
      return cloneDataView(object, isDeep);

    case float32Tag$1: case float64Tag$1:
    case int8Tag$1: case int16Tag$1: case int32Tag$1:
    case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
      return cloneTypedArray(object, isDeep);

    case mapTag$3:
      return new Ctor;

    case numberTag$1:
    case stringTag$1:
      return new Ctor(object);

    case regexpTag$1:
      return cloneRegExp(object);

    case setTag$3:
      return new Ctor;

    case symbolTag$1:
      return cloneSymbol(object);
  }
}

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject$1(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/** `Object#toString` result references. */
var mapTag$2 = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike(value) && getTag$1(value) == mapTag$2;
}

/* Node.js helper references. */
var nodeIsMap = nodeUtil && nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

/** `Object#toString` result references. */
var setTag$2 = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike(value) && getTag$1(value) == setTag$2;
}

/* Node.js helper references. */
var nodeIsSet = nodeUtil && nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$1 = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG$1 = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag$1 = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag$1 = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag$1] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag$1] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG$1,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG$1;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject$1(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag$1(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

/**
 * Converts `string`, as a whole, to lower case just like
 * [String#toLowerCase](https://mdn.io/toLowerCase).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the lower cased string.
 * @example
 *
 * _.toLower('--Foo-Bar--');
 * // => '--foo-bar--'
 *
 * _.toLower('fooBar');
 * // => 'foobar'
 *
 * _.toLower('__FOO_BAR__');
 * // => '__foo_bar__'
 */
function toLower(value) {
  return toString(value).toLowerCase();
}

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike(value) &&
      (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer(value) || isTypedArray(value) || isArguments(value))) {
    return !value.length;
  }
  var tag = getTag$1(value);
  if (tag == mapTag || tag == setTag) {
    return !value.size;
  }
  if (isPrototype(value)) {
    return !baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

const LOADING_SCRIPTS = {};

let options$1 = {};

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
  return deepmerge__default["default"](x, y, {
    arrayMerge,
  });
}

function setOptions(optns) {
  options$1 = optns;
}

function getOptions() {
  return options$1;
}

function isObject(val) {
  return val && typeof val === 'object' && !(val instanceof Array);
}

function camelCase(str) {
  return fastCase.camelize(str);
}

function snakeCase(str) {
  return fastCase.decamelize(str, '_');
}

function toCamel(obj) {
  if (!obj) return obj;
  const objCopy = JSON.parse(JSON.stringify(obj));
  return fastCase.camelizeKeys(objCopy);
}

function toCamelPath(str) {
  if (typeof str === 'string') {
    return str.split('.').map(fastCase.camelize).join('.');
  }
  return str;
}

function toSnake(obj) {
  if (!obj) return obj;
  const objCopy = JSON.parse(JSON.stringify(obj));
  return fastCase.decamelizeKeys(objCopy, '_');
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
  return qs.stringify(str);
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
  const vaultUrl = options$1.vaultUrl;
  const timeout = options$1.timeout;
  const requestId = vaultRequestId();
  const callback = `swell_vault_response_${requestId}`;

  data = {
    $jsonp: {
      method,
      callback,
    },
    $data: data,
    $key: options$1.key,
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
        resolve(result.$data);
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

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  defaultMethods: defaultMethods,
  set: set,
  get: get,
  uniq: uniq,
  find: find,
  round: round,
  pick: pick,
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
  toNumber: toNumber,
  toLower: toLower,
  isEqual: isEqual,
  isEmpty: isEmpty,
  snakeCase: snakeCase,
  map: map,
  reduce: reduce,
  base64Encode: base64Encode,
  vaultRequest: vaultRequest,
  getLocationParams: getLocationParams,
  removeUrlParams: removeUrlParams,
  loadScript: loadScript,
  isLiveMode: isLiveMode
});

const cardApi = {
  async createToken(data) {
    let error = null;
    let code = null;
    let param = null;
    if (!data) {
      error = 'Card details are missing in `swell.card.createToken(card)`';
      param = '';
    }
    const card = toSnake(data);
    if (!card.nonce) {
      if (!this.validateNumber(card.number)) {
        error = 'Card number appears to be invalid';
        code = 'invalid_card_number';
        param = 'number';
      }
      if (card.exp) {
        const exp = this.expiry(card.exp);
        card.exp_month = exp.month;
        card.exp_year = exp.year;
      }
      if (!this.validateExpiry(card.exp_month, card.exp_year)) {
        error = 'Card expiry appears to be invalid';
        code = 'invalid_card_expiry';
        param = 'exp_month';
      }
      if (!this.validateCVC(card.cvc)) {
        error = 'Card CVC code appears to be invalid';
        code = 'invalid_card_cvc';
        param = 'exp_cvc';
      }
    }

    if (error) {
      const err = new Error(error);
      err.code = code || 'invalid_card';
      err.status = 402;
      err.param = param;
      throw err;
    }

    // Get a token from the vault
    const result = await vaultRequest('post', '/tokens', card);
    if (result.errors) {
      const param = Object.keys(result.errors)[0];
      const err = new Error(result.errors[param].message || 'Unknown error');
      err.code = 'vault_error';
      err.status = 402;
      err.param = param;
      throw err;
    }
    return result;
  },

  expiry(value) {
    if (value && value.month && value.year) {
      return value;
    }

    const parts = new String(value).split(/[\s\/\-]+/, 2);
    const month = parts[0];
    let year = parts[1];

    // Convert 2 digit year
    if (year && year.length === 2 && /^\d+$/.test(year)) {
      const prefix = new Date().getFullYear().toString().substring(0, 2);
      year = prefix + year;
    }

    return {
      month: ~~month,
      year: ~~year,
    };
  },

  types() {
    let e, t, n, r;
    t = {};
    for (e = n = 40; n <= 49; e = ++n) t[e] = 'Visa';
    for (e = r = 50; r <= 59; e = ++r) t[e] = 'MasterCard';
    return (
      (t[34] = t[37] = 'American Express'),
      (t[60] = t[62] = t[64] = t[65] = 'Discover'),
      (t[35] = 'JCB'),
      (t[30] = t[36] = t[38] = t[39] = 'Diners Club'),
      t
    );
  },

  type(num) {
    return this.types()[num.slice(0, 2)] || 'Unknown';
  },

  luhnCheck(num) {
    let t, n, r, i, s, o;
    (r = !0), (i = 0), (n = (num + '').split('').reverse());
    for (s = 0, o = n.length; s < o; s++) {
      (t = n[s]), (t = parseInt(t, 10));
      if ((r = !r)) t *= 2;
      t > 9 && (t -= 9), (i += t);
    }
    return i % 10 === 0;
  },

  validateNumber(num) {
    return (
      (num = (num + '').replace(/\s+|-/g, '')),
      num.length >= 10 && num.length <= 16 && this.luhnCheck(num)
    );
  },

  validateExpiry(month, year) {
    let r, i;
    return (
      (month = String(month).trim()),
      (year = String(year).trim()),
      /^\d+$/.test(month)
        ? /^\d+$/.test(year)
          ? parseInt(month, 10) <= 12
            ? ((i = new Date(year, month)),
              (r = new Date()),
              i.setMonth(i.getMonth() - 1),
              i.setMonth(i.getMonth() + 1, 1),
              i > r)
            : !1
          : !1
        : !1
    );
  },

  validateCVC(val) {
    return (
      (val = String(val).trim()),
      /^\d+$/.test(val) && val.length >= 3 && val.length <= 4
    );
  },
};

const COOKIE_MAX_AGE = 604800; // 1 week

function getCookie(name) {
  if (isServer()) {
    return undefined;
  }

  const matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[]\\\/\+^])/g, '\\$1') + '=([^;]*)',
    ),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  if (isServer()) {
    return;
  }

  // default cookie options, which can be overridden
  options = {
    path: '/',
    'max-age': COOKIE_MAX_AGE,
    samesite: 'lax',
    ...options,
  };

  if (options.expires && options.expires.toUTCString) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie =
    encodeURIComponent(name) + '=' + encodeURIComponent(value);

  for (const optionKey in options) {
    updatedCookie += '; ' + optionKey;
    const optionValue = options[optionKey];

    if (optionValue !== true) {
      updatedCookie += '=' + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

const RECORD_TIMEOUT = 5000;

let VALUES = {
  /*
  [model]: {
    [id]: {
      data,
      record,
      recordTimer,
      presets,
    }
  }
*/
};

const cacheApi = {
  options: {
    enabled: true,
    debug: false,
  },

  debug(...args) {
    if (this.options.debug) {
      console.log(...args);
    }
  },

  values({ model, id }, setValues = undefined) {
    this.debug('cache.values', ...arguments);
    if (setValues !== undefined) {
      for (let key in setValues) {
        set(VALUES, `${model}.${id}.${key}`, setValues[key]);
      }
      return;
    }
    return get(VALUES, `${model}.${id}`, {});
  },

  preset(details) {
    this.debug('cache.preset', ...arguments);
    const { presets = [] } = this.values(details);
    presets.push(details);
    this.values(details, { presets });
  },

  set(details) {
    this.debug('cache.set', ...arguments);
    let { model, id, path, value } = details;
    let { data = {}, record, presets } = this.values(details);

    if (id === null) {
      return;
    }

    if (record === undefined) {
      return this.preset(details);
    }

    data = merge(record || {}, data);

    const { useCamelCase } = getOptions();
    if (useCamelCase && value && typeof value === 'object') {
      value = toCamel(value);
    }

    if (path || value instanceof Array) {
      let upData = { ...(data || {}) };
      let upPath = useCamelCase ? toCamelPath(path) : path;
      set(upData, upPath || '', value);
      data = upData;
    } else if (value && typeof value === 'object') {
      data = data || {};
      data = merge(data, value);
    } else {
      data = value;
    }

    this.values(details, { data });

    try {
      // Make sure values have clean refs
      const cache = VALUES[model][id];
      if (cache !== undefined) {
        if (cache.data !== undefined) {
          cache.data = JSON.parse(JSON.stringify(cache.data));
        }
        if (cache.record !== undefined) {
          cache.record = JSON.parse(JSON.stringify(cache.record));
        }
      }
    } catch (err) {
      // noop
    }
  },

  get(model, id) {
    this.debug('cache.get', ...arguments);
    const { data, recordTimer } = this.values({ model, id });
    this.debug('cache.get:data+recordTimer', ...arguments);
    if (recordTimer) {
      return data;
    }
  },

  setRecord(record, details) {
    this.debug('cache.setRecord', ...arguments);
    let { recordTimer, presets } = this.values(details);

    if (recordTimer) {
      clearTimeout(recordTimer);
    }

    recordTimer = setTimeout(() => {
      this.values(details, { record: undefined, recordTimer: undefined });
    }, RECORD_TIMEOUT);

    // Record has to be null at minimum, not undefined
    this.values(details, {
      record: record !== undefined ? record : null,
      recordTimer,
    });

    if (presets) {
      for (let preset of presets) {
        this.set(preset);
      }
      this.values(details, { presets: undefined });
    }

    const result = this.get(details.model, details.id);

    return result !== undefined ? result : record;
  },

  async getFetch(model, id, fetch) {
    if (this.options.enabled) {
      this.debug('cache.getFetch', ...arguments);
      const value = this.get(model, id);

      if (value !== undefined) {
        return value;
      }
    }

    const record = await fetch();
    return this.setRecord(record, { model, id });
  },

  clear(model = undefined, id = undefined) {
    this.debug('cache.clear', ...arguments);
    if (model) {
      if (id) {
        set(VALUES, `${model}.${id}`, undefined);
      } else {
        set(VALUES, model, undefined);
      }
    } else {
      VALUES = {};
    }
  },
};

function methods$a(request) {
  const { get, list } = defaultMethods(request, '/attributes', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('attributes', id, () => get(id, ...args));
    },

    list,
  };
}

let OPTIONS;

function methods$9(request, opt) {
  OPTIONS = opt;
  const { get, list } = defaultMethods(request, '/products', ['list', 'get']);
  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('products', id, () => get(id, ...args));
    },

    list,

    variation: calculateVariation,

    categories: getCategories,

    attributes: getAttributes,

    priceRange: getPriceRange,

    filters: getFilters,

    filterableAttributeFilters: (products, options) =>
      getFilterableAttributeFilters(request, products, options),
  };
}

function getProductOptionIndex(product, filter = undefined) {
  if (!product.options) {
    return {};
  }
  const productOptions = filter
    ? product.options.filter(filter)
    : product.options;
  return reduce(
    productOptions,
    (acc, op) => {
      const values = reduce(
        op.values,
        (acc, val) => ({
          ...acc,
          [val.id]: { ...val, id: val.id },
          [val.name]: { ...val, id: val.id },
        }),
        {},
      );
      return {
        ...acc,
        [op.id]: { ...op, values },
        [op.name]: { ...op, values },
      };
    },
    {},
  );
}

function cleanProductOptions(options) {
  let result = options || [];
  if (options && typeof options === 'object' && !(options instanceof Array)) {
    result = [];
    for (const key in options) {
      result.push({
        id: key,
        value: options[key],
      });
    }
  }
  if (result instanceof Array) {
    return result.map((op) => ({
      id: op.id || op.name,
      value: op.value,
    }));
  }
  return result;
}

function findVariantWithOptionValueIds(product, ids) {
  if (ids.length > 0) {
    const variants = product.variants && product.variants.results;
    if (variants.length > 0) {
      for (const variant of variants) {
        const variantObj = toSnake(variant);
        const matched = isEqual(variantObj.option_value_ids.sort(), ids.sort());
        if (matched) {
          return variant;
        }
      }
    }
  }
  return null;
}

function calculateVariation(input, options, purchaseOption) {
  const product = OPTIONS.useCamelCase ? toSnake(input) : input;
  const purchaseOp = findPurchaseOption(product, purchaseOption);
  const variation = {
    ...product,
    price: typeof purchaseOp.price !== 'number' ? null : purchaseOp.price,
    sale_price: purchaseOp.sale_price,
    orig_price: purchaseOp.orig_price,
    stock_status: product.stock_status,
  };
  let optionPrice = 0;
  const variantOptionValueIds = [];
  const cleanOptions = cleanProductOptions(options);
  const index = getProductOptionIndex(product);
  for (const option of cleanOptions) {
    if (index[option.id] && index[option.id].values[option.value]) {
      if (index[option.id].variant) {
        variantOptionValueIds.push(index[option.id].values[option.value].id);
      } else {
        optionPrice += index[option.id].values[option.value].price || 0;
      }
    }
  }
  if (variantOptionValueIds.length > 0) {
    const variant = findVariantWithOptionValueIds(
      product,
      variantOptionValueIds,
    );
    if (variant) {
      let variantPurchaseOp = purchaseOp;
      try {
        variantPurchaseOp = findPurchaseOption(variant, purchaseOption);
      } catch (err) {
        // noop
      }
      variation.variant_id = variant.id;
      variation.price = variantPurchaseOp.price || 0;
      variation.sale_price =
        variantPurchaseOp.sale_price || purchaseOp.sale_price;
      variation.orig_price =
        variantPurchaseOp.orig_price || purchaseOp.orig_price;
      variation.stock_status = variant.stock_status;
      variation.stock_level = variant.stock_level || 0;
      variation.images =
        (variant.images && variant.images.length
          ? variant.images
          : product.images) || [];
    }
  }
  if (optionPrice > 0) {
    variation.price += optionPrice;
    if (variation.sale_price) {
      variation.sale_price += optionPrice;
    }
    if (variation.orig_price) {
      variation.orig_price += optionPrice;
    }
  }
  if (variation.sale_price === undefined) {
    delete variation.sale_price;
  }
  if (variation.orig_price === undefined) {
    delete variation.orig_price;
  }
  return OPTIONS.useCamelCase ? toCamel(variation) : variation;
}

function findPurchaseOption(product, purchaseOption) {
  const plan = get(purchaseOption, 'plan_id', get(purchaseOption, 'plan'));
  const type = get(
    purchaseOption,
    'type',
    typeof purchaseOption === 'string'
      ? purchaseOption
      : plan !== undefined
      ? 'subscription'
      : 'standard',
  );
  let option = get(product, `purchase_options.${type}`);
  if (!option && type !== 'standard') {
    throw new Error(
      `Product purchase option '${type}' not found or not active`,
    );
  }
  if (option) {
    if (option.plans) {
      if (plan !== undefined) {
        option = find(option.plans, { id: plan });
        if (!option) {
          throw new Error(
            `Subscription purchase plan '${plan}' not found or not active`,
          );
        }
      } else {
        option = option.plans[0];
      }
    }
    return {
      ...option,
      price: typeof option.price === 'number' ? option.price : product.price,
      sale_price:
        typeof option.sale_price === 'number'
          ? option.sale_price
          : product.sale_price,
      orig_price:
        typeof option.orig_price === 'number'
          ? option.orig_price
          : product.orig_price,
    };
  }
  return {
    type: 'standard',
    price: product.price,
    sale_price: product.sale_price,
    orig_price: product.orig_price,
  };
}

async function getFilterableAttributeFilters(request, products, options) {
  const { results: filterableAttributes } = await methods$a(
    request).list({
    filterable: true,
  });

  return getFilters(products, { ...options, filterableAttributes });
}

function getFilters(products, options = {}) {
  let attributes =
    (options.attributes || options.attributes === undefined) &&
    getAttributes(products);

  if (options.filterableAttributes) {
    attributes = attributes.filter((productAttr) =>
      options.filterableAttributes.find(
        (filterableAttr) => productAttr.id === filterableAttr.id,
      ),
    );
  }

  const categories =
    (options.categories || options.categories === undefined) &&
    getCategories(products);
  const priceRange =
    (options.price || options.price === undefined) && getPriceRange(products);

  let filters = [];

  if (priceRange) {
    filters.push({
      id: 'price',
      label: 'Price',
      type: 'range',
      options: [
        {
          value: priceRange.min,
          label: priceRange.min, // TODO: formatting
        },
        {
          value: priceRange.max,
          label: priceRange.max, // TODO: formatting
        },
      ],
      interval: priceRange.interval,
    });
  }

  if (categories && categories.length > 0) {
    filters.push({
      id: 'category',
      label: 'Category',
      type: 'select',
      options: categories.map((category) => ({
        value: category.slug,
        label: category.name,
      })),
    });
  }

  if (attributes && attributes.length > 0) {
    filters = [
      ...filters,
      ...reduce(
        attributes,
        (acc, attr) => [
          ...acc,
          ...(attr.id !== 'category' &&
          attr.id !== 'price' &&
          attr.values instanceof Array &&
          attr.values.length > 0
            ? [
                {
                  id: attr.id,
                  label: attr.name,
                  type: 'select',
                  options: attr.values.map((value) => ({
                    value,
                    label: value,
                  })),
                },
              ]
            : []),
        ],
        [],
      ),
    ];
  }

  return filters;
}

function getCategories(products) {
  const categories = [];
  const collection =
    (products && products.results) || (products.id ? [products] : products);
  if (collection instanceof Array) {
    for (let product of collection) {
      if (product.categories) {
        for (let category of product.categories) {
          if (!category) continue;
          let ex = find(categories, { id: category.id });
          if (!ex) {
            categories.push(category);
          }
        }
      }
    }
  }
  return categories;
}

function getAttributes(products) {
  const attributes = [];
  const collection =
    (products && products.results) || (products.id ? [products] : products);
  if (collection instanceof Array) {
    for (let product of collection) {
      if (product.attributes) {
        for (let id in product.attributes) {
          if (!product.attributes[id]) continue;
          const value = product.attributes[id].value;
          let attr = find(attributes, { id: snakeCase(id) });
          if (attr) {
            attr.values = uniq([
              ...attr.values,
              ...(value instanceof Array ? value : [value]),
            ]);
          } else {
            attributes.push({
              ...product.attributes[id],
              value: undefined,
              values: [...(value instanceof Array ? value : [value])],
            });
          }
        }
      }
    }
  }
  return attributes;
}

function getPriceRange(products) {
  let min;
  let max;
  let interval;
  const collection =
    (products && products.results) || (products.id ? [products] : products);
  if (collection instanceof Array) {
    for (let product of collection) {
      if (max === undefined || product.price > max) {
        max = Math.ceil(product.price);
      }
      if (min === undefined || product.price < min) {
        min = Math.floor(product.price);
      }
    }
  }
  if (min === max) {
    return null;
  }
  interval = Math.ceil((max - min) / 10) || 1;
  if (interval > 1000) {
    interval = 1000;
  } else if (interval > 100) {
    interval = 100;
  } else if (interval > 10) {
    interval = 10;
  }
  if (max % interval > 0) {
    max = interval + max - (max % interval);
  }
  if (min % interval > 0) {
    min = min - (min % interval);
  }
  while (((max - min) / interval) % 1 > 0) {
    max++;
  }
  return {
    min,
    max,
    interval,
  };
}

function methods$8(request, options) {
  return {
    state: null,
    order: null,
    settings: null,
    requested: false,
    pendingRequests: [],
    cacheClear: null,

    async requestStateChange(method, url, id, data) {
      return this.requestStateSync(async () => {
        const result = await request(method, url, id, data);
        if (result && result.errors) {
          return result;
        }
        this.state = result;
        return result;
      });
    },

    async requestStateSync(handler) {
      if (this.state) {
        return await handler();
      } else if (this.requested) {
        return new Promise((resolve) => {
          this.pendingRequests.push({ handler, resolve });
        });
      }

      this.requested = true;
      const result = await handler();
      this.requested = false;
      while (this.pendingRequests.length > 0) {
        const { handler, resolve } = this.pendingRequests.shift();
        resolve(handler());
      }
      return result;
    },

    get() {
      if (options.getCart) {
        return options.getCart();
      }
      let data;
      if (this.cacheClear) {
        this.cacheClear = null;
        data = { $cache: false };
      }
      return this.requestStateChange('get', '/cart', undefined, data);
    },

    clearCache() {
      this.cacheClear = true;
    },

    getItemData(item, data = {}) {
      let result = cloneDeep(item);
      if (typeof item === 'string') {
        result = {
          ...(data || {}),
          product_id: item,
        };
      }
      if (result && result.options) {
        result.options = cleanProductOptions(result.options);
      }
      return result;
    },

    addItem(item, data) {
      return this.requestStateChange(
        'post',
        '/cart/items',
        this.getItemData(item, data),
      );
    },

    updateItem(id, item) {
      return this.requestStateChange(
        'put',
        `/cart/items/${id}`,
        this.getItemData(item),
      );
    },

    setItems(input) {
      let items = input;
      if (items && items.map) {
        items = items.map(this.getItemData);
      }
      return this.requestStateChange('put', '/cart/items', items);
    },

    removeItem(id) {
      return this.requestStateChange('delete', `/cart/items/${id}`);
    },

    recover(checkoutId) {
      return this.requestStateChange('put', `/cart/recover/${checkoutId}`);
    },

    update(input) {
      let data = input;
      if (data.items && data.items.map) {
        data = {
          ...data,
          items: data.items.map(this.getItemData),
        };
      }
      if (options.updateCart) {
        return options.updateCart(input);
      }
      return this.requestStateChange('put', `/cart`, data);
    },

    applyCoupon(code) {
      return this.requestStateChange('put', '/cart/coupon', { code });
    },

    removeCoupon() {
      return this.requestStateChange('delete', '/cart/coupon');
    },

    applyGiftcard(code) {
      return this.requestStateChange('post', '/cart/giftcards', { code });
    },

    removeGiftcard(id) {
      return this.requestStateChange('delete', `/cart/giftcards/${id}`);
    },

    async getShippingRates() {
      await this.requestStateChange('get', '/cart/shipment-rating');
      return this.state[
        options.useCamelCase ? 'shipmentRating' : 'shipment_rating'
      ];
    },

    async submitOrder() {
      const result = await request('post', '/cart/order');
      if (result.errors) {
        return result;
      }
      this.state = null;
      this.order = result;
      return result;
    },

    async getOrder(checkoutId = undefined) {
      let result;
      if (checkoutId) {
        result = await request('get', `/cart/order`, {
          checkout_id: checkoutId,
        });
      } else {
        result = await request('get', `/cart/order`);
      }
      this.order = result;
      return result;
    },

    async getSettings() {
      this.settings = await request('get', '/cart/settings');
      return this.settings;
    },
  };
}

function methods$7(request) {
  return {
    state: null,

    async requestStateChange(method, url, id, data) {
      const result = await request(method, url, id, data);
      if (result && result.errors) {
        return result;
      }
      return (this.state = result);
    },

    get(query) {
      return this.requestStateChange('get', '/account', query);
    },

    create(data) {
      return this.requestStateChange('post', '/account', data);
    },

    update(data) {
      return this.requestStateChange('put', '/account', data);
    },

    login(email, password) {
      if (password && password.password_token) {
        return this.requestStateChange('post', '/account/login', {
          email,
          password_token: password.password_token,
        });
      }
      return this.requestStateChange('post', '/account/login', {
        email,
        password,
      });
    },

    logout() {
      this.state = null;
      return request('post', '/account/logout');
    },

    recover(data) {
      return request('post', '/account/recover', data);
    },

    listAddresses(query) {
      return request('get', '/account/addresses', query);
    },

    createAddress(data) {
      return request('post', '/account/addresses', data);
    },

    updateAddress(id, data) {
      return request('put', `/account/addresses/${id}`, data);
    },

    deleteAddress(id) {
      return request('delete', `/account/addresses/${id}`);
    },

    listCards(query) {
      return request('get', '/account/cards', query);
    },

    createCard(data) {
      return request('post', '/account/cards', data);
    },

    updateCard(id, data) {
      return request('put', `/account/cards/${id}`, data);
    },

    deleteCard(id) {
      return request('delete', `/account/cards/${id}`);
    },

    listOrders(query) {
      return request('get', `/account/orders`, query);
    },

    getOrder(id) {
      return request('get', `/account/orders/${id}`);
    },

    // Deprecated methods
    getAddresses(query) {
      return request('get', '/account/addresses', query);
    },
    getCards(query) {
      return request('get', '/account/cards', query);
    },
    getOrders(query) {
      return request('get', `/account/orders`, query);
    },
  };
}

function methods$6(request) {
  const { get, list } = defaultMethods(request, '/categories', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('categories', id, () => get(id, ...args));
    },

    list,
  };
}

function methods$5(request) {
  const { get, list } = defaultMethods(request, '/subscriptions', [
    'list',
    'get',
  ]);
  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('subscriptions', id, () => get(id, ...args));
    },

    list,

    getCleanData(data) {
      if (data && data.options) {
        data.options = cleanProductOptions(data.options);
      }
      if (data.items && data.items.map) {
        data.items = data.items.map((item) => {
          if (item.options) {
            item.options = cleanProductOptions(item.options);
          }
          return item;
        });
      }
      return data;
    },

    create(data) {
      return request('post', '/subscriptions', this.getCleanData(data));
    },

    update(id, data) {
      return request('put', `/subscriptions/${id}`, this.getCleanData(data));
    },

    addItem(id, item) {
      return request(
        'post',
        `/subscriptions/${id}/items`,
        this.getCleanData(item),
      );
    },

    setItems(id, items) {
      if (items && items.map) {
        items = items.map(this.getCleanData);
      }
      return request('put', `/subscriptions/${id}/items`, items);
    },

    updateItem(id, itemId, item) {
      return request(
        'put',
        `/subscriptions/${id}/items/${itemId}`,
        this.getCleanData(item),
      );
    },

    removeItem(id, itemId) {
      return request('delete', `/subscriptions/${id}/items/${itemId}`);
    },
  };
}

function methods$4(request) {
  const { get, list } = defaultMethods(request, '/invoices', ['list', 'get']);
  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('invoices', id, () => get(id, ...args));
    },

    list,
  };
}

function methods$3(request, opt) {
  return {
    get: (type, id, query) => {
      return cacheApi.getFetch(`content_${type}`, id, () =>
        request('get', `/content/${type}`, id, {
          $preview: opt.previewContent,
          ...(query || {}),
        }),
      );
    },

    list: (type, query) => request('get', `/content/${type}`, undefined, query),
  };
}

function methods$2(request, opt) {
  return {
    state: null,
    menuState: null,
    paymentState: null,
    subscriptionState: null,
    sessionState: null,
    localizedState: {},

    refresh() {
      this.state = null;
      this.menuState = null;
      this.paymentState = null;
      this.subscriptionState = null;
      this.sessionState = null;
      this.localizedState = {};
      return this.get();
    },

    getState(
      uri,
      stateName,
      { id = undefined, def = undefined, refresh = false } = {},
    ) {
      if (!this[stateName] || refresh) {
        this[stateName] = request('get', uri);
      }
      if (this[stateName] && typeof this[stateName].then === 'function') {
        return this[stateName].then((state) => {
          this[stateName] = state;
          return this.getLocalizedState(stateName, id, def);
        });
      }
      return this.getLocalizedState(stateName, id, def);
    },

    getLocalizedState(stateName, id, def) {
      const locale = this.getCurrentLocale();

      const ls = this.localizedState;
      if (ls.code !== locale) {
        ls.code = locale;
        delete ls[locale];
      }
      if (!ls[locale]) {
        ls[locale] = {};
      }
      if (!ls[locale][stateName]) {
        ls[locale][stateName] = this.decodeLocale(this[stateName]);
      }
      return id ? get(ls[locale][stateName], id, def) : ls[locale][stateName];
    },

    findState(uri, stateName, { where = undefined, def = undefined } = {}) {
      const state = this.getState(uri, stateName);
      if (state && typeof state.then === 'function') {
        return state.then((state) => find(state, where) || def);
      }
      return find(state, where) || def;
    },

    get(id = undefined, def = undefined) {
      return this.getState('/settings', 'state', { id, def });
    },

    getCurrentLocale() {
      return opt.api.locale.selected();
    },

    getStoreLocale() {
      return get(this.state, 'store.locale');
    },

    getStoreLocales() {
      return get(this.state, 'store.locales');
    },

    set({ model, path, value }) {
      const locale = this.getCurrentLocale();
      const stateName = model ? `${model.replace(/s$/, '')}State` : 'state';
      const { useCamelCase } = opt;

      let mergeData = {};

      if (path) set(mergeData, path, value);
      else mergeData = value;

      if (useCamelCase) {
        mergeData = toCamel(mergeData);
      }

      this[stateName] = merge(this[stateName] || {}, mergeData);

      if (this.localizedState[locale]) {
        this.localizedState[locale][stateName] = this.decodeLocale(
          this[stateName],
        );
      }
    },

    menus(id = undefined, def = undefined) {
      return this.findState('/settings/menus', 'menuState', {
        where: { id },
        def,
      });
    },

    payments(id = undefined, def = undefined) {
      return this.getState('/settings/payments', 'paymentState', { id, def });
    },

    subscriptions(id = undefined, def = undefined) {
      return this.getState('/settings/subscriptions', 'subscriptionState', {
        id,
        def,
      });
    },

    session(id = undefined, def = undefined) {
      return this.getState('/session', 'sessionState', { id, def });
    },

    decodeLocale(values) {
      const locale = this.getCurrentLocale();

      if (!values || typeof values !== 'object') {
        return values;
      }

      let configs = this.getStoreLocales();
      if (configs) {
        configs = configs.reduce(
          (acc, config) => ({
            ...acc,
            [config.code]: config,
          }),
          {},
        );
      } else {
        configs = {};
      }

      return decodeLocaleObjects(cloneDeep(values), locale, configs, opt);
    },

    async load() {
      try {
        const { settings, menus, payments, subscriptions, session } =
          await request('get', '/settings/all');

        this.localizedState = {};

        this.set({
          value: settings,
        });

        this.set({
          model: 'menus',
          value: menus,
        });

        this.set({
          model: 'payments',
          value: payments,
        });

        this.set({
          model: 'subscriptions',
          value: subscriptions,
        });

        this.set({
          model: 'session',
          value: session,
        });
      } catch (err) {
        console.error(`Swell: unable to loading settings (${err})`);
      }
    },
  };
}

function decodeLocaleObjects(values, locale, configs, opt) {
  if (isObject(values)) {
    const keys = Object.keys(values);
    for (let key of keys) {
      if (key === '$locale') {
        decodeLocaleValue(locale, values, key, configs, opt);
        delete values.$locale;
      }
      if (values[key] !== undefined) {
        values[key] = decodeLocaleObjects(values[key], locale, configs, opt);
      }
    }
  } else if (values instanceof Array) {
    for (var i = 0; i < values.length; i++) {
      values[i] = decodeLocaleObjects(values[i], locale, configs, opt);
    }
  }
  return values;
}

function decodeLocaleValue(locale, values, key, configs, opt) {
  if (!locale || !isObject(values[key])) {
    return;
  }

  let returnLocaleKey;
  let returnLocaleConfig;
  const localeKeys = Object.keys(values[key]);
  for (let localeKey of localeKeys) {
    const shortKey = localeKey.replace(/\-.+$/, '');
    const transformedLocale = opt.useCamelCase ? camelCase(locale) : locale;

    if (
      localeKey === locale ||
      localeKey === transformedLocale ||
      shortKey === transformedLocale
    ) {
      returnLocaleKey = locale;
      returnLocaleConfig = configs[locale];
    }
  }

  // Find configured locale for fallback
  if (!returnLocaleKey && isObject(configs)) {
    const localeKeys = Object.keys(configs);
    for (let localeKey of localeKeys) {
      const shortKey = localeKey.replace(/\-.+$/, '');
      if (localeKey === locale || shortKey === locale) {
        returnLocaleKey = localeKey;
        returnLocaleConfig = configs[localeKey];
      }
    }
  }

  // Find fallback key and values if applicable
  let fallbackKeys;
  let fallbackValues = {};
  if (returnLocaleConfig) {
    let fallbackKey = returnLocaleConfig.fallback;
    const origFallbackKey = fallbackKey;
    while (fallbackKey) {
      fallbackKeys = fallbackKeys || [];
      fallbackKeys.push(fallbackKey);
      fallbackValues = {
        ...(values[key][fallbackKey] || {}),
        ...fallbackValues,
      };
      fallbackKey = configs[fallbackKey] && configs[fallbackKey].fallback;
      if (origFallbackKey === fallbackKey) {
        break;
      }
    }
  }

  // Merge locale value with fallbacks
  let localeValues = {
    ...fallbackValues,
    ...(values[key][returnLocaleKey] || {}),
  };
  const valueKeys = Object.keys(localeValues);
  for (let valueKey of valueKeys) {
    const hasValue =
      localeValues[valueKey] !== null && localeValues[valueKey] !== '';
    let shouldFallback = fallbackKeys && !hasValue;
    if (shouldFallback) {
      for (let fallbackKey of fallbackKeys) {
        shouldFallback =
          !values[key][fallbackKey] ||
          values[key][fallbackKey][valueKey] === null ||
          values[key][fallbackKey][valueKey] === '';
        if (shouldFallback) {
          if (fallbackKey === 'none') {
            values[valueKey] = null;
            break;
          }
          continue;
        } else {
          values[valueKey] = values[key][fallbackKey][valueKey];
          break;
        }
      }
    } else {
      if (hasValue) {
        values[valueKey] = localeValues[valueKey];
      }
    }
  }
}

const SCRIPT_HANDLERS = {
  'stripe-js': loadStripe,
  'paypal-sdk': loadPaypal,
  'google-pay': loadGoogle,
  'braintree-web': loadBraintree,
  'braintree-paypal-sdk': loadBraintreePaypal,
  'braintree-web-paypal-checkout': loadBraintreePaypalCheckout,
  'braintree-google-payment': loadBraintreeGoogle,
  'braintree-apple-payment': loadBraintreeApple,
  'amazon-checkout': loadAmazonCheckout,
};

async function loadStripe() {
  if (!window.Stripe || window.Stripe.version !== 3) {
    await loadScript('stripe-js', 'https://js.stripe.com/v3/');
  }

  if (!window.Stripe) {
    console.error('Warning: Stripe was not loaded');
  }

  if (window.Stripe.StripeV3) {
    window.Stripe = window.Stripe.StripeV3;
  }

  if (window.Stripe.version !== 3) {
    console.error('Warning: Stripe V3 was not loaded');
  }
}

async function loadPaypal(params) {
  if (!window.paypal) {
    await loadScript(
      'paypal-sdk',
      `https://www.paypal.com/sdk/js?currency=${params.currency}&client-id=${params.client_id}&merchant-id=${params.merchant_id}&intent=authorize&commit=false`,
      {
        'data-partner-attribution-id': 'SwellCommerce_SP',
      },
    );
  }

  if (!window.paypal) {
    console.error('Warning: PayPal was not loaded');
  }
}

async function loadGoogle() {
  if (!window.google) {
    await loadScript('google-pay', 'https://pay.google.com/gp/p/js/pay.js');
  }

  if (!window.google) {
    console.error('Warning: Google was not loaded');
  }
}

async function loadBraintree() {
  if (!window.braintree) {
    await loadScript(
      'braintree-web',
      'https://js.braintreegateway.com/web/3.73.1/js/client.min.js',
    );
  }

  if (!window.braintree) {
    console.error('Warning: Braintree was not loaded');
  }
}

async function loadBraintreePaypal(params) {
  if (!window.paypal) {
    await loadScript(
      'braintree-paypal-sdk',
      `https://www.paypal.com/sdk/js?client-id=${params.client_id}&merchant-id=${params.merchant_id}&vault=true`,
    );
  }

  if (!window.paypal) {
    console.error('Warning: Braintree PayPal was not loaded');
  }
}

async function loadBraintreePaypalCheckout() {
  if (window.braintree && !window.braintree.paypalCheckout) {
    await loadScript(
      'braintree-web-paypal-checkout',
      'https://js.braintreegateway.com/web/3.73.1/js/paypal-checkout.min.js',
    );
  }

  if (window.braintree && !window.braintree.paypalCheckout) {
    console.error('Warning: Braintree PayPal Checkout was not loaded');
  }
}

async function loadBraintreeGoogle() {
  if (window.braintree && !window.braintree.googlePayment) {
    await loadScript(
      'braintree-google-payment',
      'https://js.braintreegateway.com/web/3.73.1/js/google-payment.min.js',
    );
  }

  if (window.braintree && !window.braintree.googlePayment) {
    console.error('Warning: Braintree Google Payment was not loaded');
  }
}

async function loadBraintreeApple() {
  if (window.braintree && !window.braintree.applePay) {
    await loadScript(
      'braintree-apple-payment',
      'https://js.braintreegateway.com/web/3.73.1/js/apple-pay.min.js',
    );
  }

  if (window.braintree && !window.braintree.applePay) {
    console.error('Warning: Braintree Apple Payment was not loaded');
  }
}

async function loadAmazonCheckout() {
  if (!window.amazon) {
    await loadScript(
      'amazon-checkout',
      'https://static-na.payments-amazon.com/checkout.js',
    );
  }

  if (!window.amazon) {
    console.error('Warning: Amazon Checkout was not loaded');
  }
}

async function loadScripts(scripts) {
  if (!scripts) {
    return;
  }

  for (const script of scripts) {
    let scriptId = script;
    let scriptParams;

    if (isObject(script)) {
      scriptId = script.id;
      scriptParams = script.params;
    }

    const scriptHandler = SCRIPT_HANDLERS[scriptId];

    if (!isFunction(scriptHandler)) {
      console.error(`Unknown script ID: ${scriptId}`);
      continue;
    }

    await scriptHandler(scriptParams);
  }

  // Wait until the scripts are fully loaded.
  // Some scripts don't work correctly in Safari without this.
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

class Payment {
  constructor(request, options, params, method) {
    this.request = request;
    this.options = options;
    this.params = params;
    this.method = method;
  }

  async loadScripts(scripts) {
    await this._populateScriptsParams(scripts);
    await loadScripts(scripts);
  }

  async getCart() {
    const cart = await methods$8(this.request, this.options).get();

    if (!cart) {
      throw new Error('Cart not found');
    }

    return this._adjustCart(cart);
  }

  async updateCart(data) {
    const updateData = cloneDeep(data);

    // account data should only be updated when the user is a guest and no email is present
    if (data.account) {
      const cart = await this.getCart();
      const shouldUpdateAccount = cart.guest && !get(cart, 'account.email');

      if (!shouldUpdateAccount) {
        delete updateData.account;
      }
    }

    const updatedCart = await methods$8(this.request, this.options).update(
      updateData,
    );

    return this._adjustCart(updatedCart);
  }

  async getSettings() {
    return methods$2(this.request, this.options).get();
  }

  async createIntent(data) {
    return this._vaultRequest('post', '/intent', data);
  }

  async updateIntent(data) {
    return this._vaultRequest('put', '/intent', data);
  }

  async authorizeGateway(data) {
    return this._vaultRequest('post', '/authorization', data);
  }

  onSuccess(data) {
    const successHandler = get(this.params, 'onSuccess');

    if (isFunction(successHandler)) {
      return successHandler(data);
    }
  }

  onCancel() {
    const cancelHandler = get(this.params, 'onCancel');

    if (isFunction(cancelHandler)) {
      return cancelHandler();
    }
  }

  onError(error) {
    const errorHandler = get(this.params, 'onError');

    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }

    console.error(error.message);
  }

  async _adjustCart(cart) {
    return this._ensureCartSettings(cart).then(toSnake);
  }

  async _ensureCartSettings(cart) {
    if (cart.settings) {
      return cart;
    }

    const settings = await this.getSettings();

    return { ...cart, settings: { ...settings.store } };
  }

  async _vaultRequest(method, url, data) {
    const response = await vaultRequest(method, url, data);

    if (response.errors) {
      const param = Object.keys(response.errors)[0];
      const err = new Error(response.errors[param].message || 'Unknown error');
      err.code = 'vault_error';
      err.status = 402;
      err.param = param;
      throw err;
    }

    return response;
  }

  async _populateScriptsParams(scripts = []) {
    for (const script of scripts) {
      await this._populateScriptWithCartParams(script);
    }
  }

  async _populateScriptWithCartParams(script) {
    const cartParams = get(script, 'params.cart');

    if (!cartParams) {
      return;
    }

    const cart = await this.getCart();

    script.params = {
      ...script.params,
      ...pick(cart, cartParams),
    };

    delete script.params.cart;
  }
}

// https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
const MINIMUM_CHARGE_AMOUNT = {
  USD: 0.5,
  AED: 2,
  AUD: 0.5,
  BGN: 1,
  BRL: 0.5,
  CAD: 0.5,
  CHF: 0.5,
  CZK: 15,
  DKK: 2.5,
  EUR: 0.5,
  GBP: 0.3,
  HKD: 4,
  HRK: 0.5,
  HUF: 175,
  INR: 0.5,
  JPY: 50,
  MXN: 10,
  MYR: 2,
  NOK: 3,
  NZD: 0.5,
  PLN: 2,
  RON: 2,
  SEK: 3,
  SGD: 0.5,
  THB: 10,
};

const addressFieldsMap$1 = {
  city: 'city',
  country: 'country',
  line1: 'address1',
  line2: 'address2',
  postal_code: 'zip',
  state: 'state',
};

const billingFieldsMap = {
  name: 'name',
  phone: 'phone',
};

function mapValues(fieldsMap, data) {
  const result = {};
  for (const [destinationKey, sourceKey] of Object.entries(fieldsMap)) {
    const value = data[sourceKey];
    if (value) {
      result[destinationKey] = value;
    }
  }
  return result;
}

function getBillingDetails(cart) {
  const details = {
    ...mapValues(billingFieldsMap, cart.billing),
  };

  if (cart.account && cart.account.email) {
    details.email = cart.account.email;
  }

  const address = mapValues(addressFieldsMap$1, cart.billing);
  if (!isEmpty(address)) {
    details.address = address;
  }

  return details;
}

function getKlarnaItems(cart) {
  const currency = toLower(get(cart, 'currency', 'eur'));
  const items = map(cart.items, (item) => ({
    type: 'sku',
    description: item.product.name,
    quantity: item.quantity,
    currency,
    amount: Math.round(toNumber(item.price_total - item.discount_total) * 100),
  }));

  const tax = get(cart, 'tax_included_total');
  if (tax) {
    items.push({
      type: 'tax',
      description: 'Taxes',
      currency,
      amount: Math.round(toNumber(tax) * 100),
    });
  }

  const shipping = get(cart, 'shipping', {});
  const shippingTotal = get(cart, 'shipment_total', {});
  if (shipping.price) {
    items.push({
      type: 'shipping',
      description: shipping.service_name,
      currency,
      amount: Math.round(toNumber(shippingTotal) * 100),
    });
  }

  return items;
}

function setKlarnaBillingShipping(source, data) {
  const shippingNameFieldsMap = {
    shipping_first_name: 'first_name',
    shipping_last_name: 'last_name',
  };
  const shippingFieldsMap = {
    phone: 'phone',
  };
  const billingNameFieldsMap = {
    first_name: 'first_name',
    last_name: 'last_name',
  };
  const billingFieldsMap = {
    email: 'email',
  };

  const fillValues = (fieldsMap, data) =>
    reduce(
      fieldsMap,
      (acc, srcKey, destKey) => {
        const value = data[srcKey];
        if (value) {
          acc[destKey] = value;
        }
        return acc;
      },
      {},
    );

  source.klarna = {
    ...source.klarna,
    ...fillValues(shippingNameFieldsMap, data.shipping),
  };
  const shipping = fillValues(shippingFieldsMap, data.shipping);
  const shippingAddress = fillValues(addressFieldsMap$1, data.shipping);
  if (shipping || shippingAddress) {
    source.source_order.shipping = {
      ...(shipping ? shipping : {}),
      ...(shippingAddress ? { address: shippingAddress } : {}),
    };
  }

  source.klarna = {
    ...source.klarna,
    ...fillValues(
      billingNameFieldsMap,
      data.billing || get(data, 'account.billing') || data.shipping,
    ),
  };
  const billing = fillValues(billingFieldsMap, data.account);
  const billingAddress = fillValues(
    addressFieldsMap$1,
    data.billing || get(data, 'account.billing') || data.shipping,
  );
  if (billing || billingAddress) {
    source.owner = {
      ...(billing ? billing : {}),
      ...(billingAddress ? { address: billingAddress } : {}),
    };
  }
}

function setBancontactOwner(source, data) {
  const fillValues = (fieldsMap, data) =>
    reduce(
      fieldsMap,
      (acc, srcKey, destKey) => {
        const value = data[srcKey];
        if (value) {
          acc[destKey] = value;
        }
        return acc;
      },
      {},
    );
  const { account = {}, billing, shipping } = data;
  const billingData = {
    ...account.shipping,
    ...account.billing,
    ...shipping,
    ...billing,
  };
  const billingAddress = fillValues(addressFieldsMap$1, billingData);

  source.owner = {
    email: account.email,
    name: billingData.name || account.name,
    ...(billingData.phone
      ? { phone: billingData.phone }
      : account.phone
      ? { phone: account.phone }
      : {}),
    ...(!isEmpty(billingAddress) ? { address: billingAddress } : {}),
  };
}

function createElement(type, elements, params) {
  const elementParams = params[type] || params;
  const elementOptions = elementParams.options || {};
  const element = elements.create(type, elementOptions);

  elementParams.onChange && element.on('change', elementParams.onChange);
  elementParams.onReady && element.on('ready', elementParams.onReady);
  elementParams.onFocus && element.on('focus', elementParams.onFocus);
  elementParams.onBlur && element.on('blur', elementParams.onBlur);
  elementParams.onEscape && element.on('escape', elementParams.onEscape);
  elementParams.onClick && element.on('click', elementParams.onClick);

  element.mount(elementParams.elementId || `#${type}-element`);

  return element;
}

async function createPaymentMethod(stripe, cardElement, cart) {
  const billingDetails = getBillingDetails(cart);
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: billingDetails,
  });

  return error
    ? { error }
    : {
        token: paymentMethod.id,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        brand: paymentMethod.card.brand,
        address_check: paymentMethod.card.checks.address_line1_check,
        cvc_check: paymentMethod.card.checks.cvc_check,
        zip_check: paymentMethod.card.checks.address_zip_check,
      };
}

async function createIDealPaymentMethod(stripe, element, cart) {
  const billingDetails = getBillingDetails(cart);
  return await stripe.createPaymentMethod({
    type: 'ideal',
    ideal: element,
    ...(billingDetails ? { billing_details: billingDetails } : {}),
  });
}

async function createKlarnaSource(stripe, cart) {
  const sourceObject = {
    type: 'klarna',
    flow: 'redirect',
    amount: Math.round(get(cart, 'grand_total', 0) * 100),
    currency: toLower(get(cart, 'currency', 'eur')),
    klarna: {
      product: 'payment',
      purchase_country: get(cart, 'settings.country', 'DE'),
    },
    source_order: {
      items: getKlarnaItems(cart),
    },
    redirect: {
      return_url: window.location.href,
    },
  };
  setKlarnaBillingShipping(sourceObject, cart);

  return await stripe.createSource(sourceObject);
}

async function createBancontactSource(stripe, cart) {
  const sourceObject = {
    type: 'bancontact',
    amount: Math.round(get(cart, 'grand_total', 0) * 100),
    currency: toLower(get(cart, 'currency', 'eur')),
    redirect: {
      return_url: window.location.href,
    },
  };
  setBancontactOwner(sourceObject, cart);

  return await stripe.createSource(sourceObject);
}

function stripeAmountByCurrency(currency, amount) {
  const zeroDecimalCurrencies = [
    'BIF', // Burundian Franc
    'DJF', // Djiboutian Franc,
    'JPY', // Japanese Yen
    'KRW', // South Korean Won
    'PYG', // Paraguayan Guaraní
    'VND', // Vietnamese Đồng
    'XAF', // Central African Cfa Franc
    'XPF', // Cfp Franc
    'CLP', // Chilean Peso
    'GNF', // Guinean Franc
    'KMF', // Comorian Franc
    'MGA', // Malagasy Ariary
    'RWF', // Rwandan Franc
    'VUV', // Vanuatu Vatu
    'XOF', // West African Cfa Franc
  ];
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return amount;
  } else {
    return Math.round(amount * 100);
  }
}

function isStripeChargeableAmount(amount, currency) {
  const minAmount = MINIMUM_CHARGE_AMOUNT[currency];
  return !minAmount || amount >= minAmount;
}

class PaymentMethodDisabledError extends Error {
  constructor(method) {
    const message = `${method} payments are disabled. See Payment settings in the Swell dashboard for details`;
    super(message);
  }
}

class UnsupportedPaymentMethodError extends Error {
  constructor(method, gateway) {
    let message = `Unsupported payment method: ${method}`;

    if (gateway) {
      message += ` (${gateway})`;
    }

    super(message);
  }
}

class UnableAuthenticatePaymentMethodError extends Error {
  constructor() {
    const message =
      'We are unable to authenticate your payment method. Please choose a different payment method and try again';
    super(message);
  }
}

class LibraryNotLoadedError extends Error {
  constructor(library) {
    const message = `${library} was not loaded`;
    super(message);
  }
}

class MethodPropertyMissingError extends Error {
  constructor(method, property) {
    const message = `${method} ${property} is missing`;
    super(message);
  }
}

class DomElementNotFoundError extends Error {
  constructor(elementId) {
    const message = `DOM element with '${elementId}' ID not found`;
    super(message);
  }
}

class StripeCardPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.card);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeCardPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeCardPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeCardPayment.stripe;
  }

  set stripe(stripe) {
    StripeCardPayment.stripe = stripe;
  }

  get stripeElement() {
    return StripeCardPayment.stripeElement;
  }

  set stripeElement(stripeElement) {
    StripeCardPayment.stripeElement = stripeElement;
  }

  async createElements() {
    const elements = this.stripe.elements(this.params.config);

    if (this.params.separateElements) {
      this.stripeElement = createElement('cardNumber', elements, this.params);
      createElement('cardExpiry', elements, this.params);
      createElement('cardCvc', elements, this.params);
    } else {
      this.stripeElement = createElement('card', elements, this.params);
    }
  }

  async tokenize() {
    if (!this.stripeElement) {
      throw new Error('Stripe payment element is not defined');
    }

    const cart = await this.getCart();
    const paymentMethod = await createPaymentMethod(
      this.stripe,
      this.stripeElement,
      cart,
    );

    if (paymentMethod.error) {
      throw new Error(paymentMethod.error.message);
    }

    // should save payment method data when payment amount is not chargeable
    if (!isStripeChargeableAmount(cart.capture_total, cart.currency)) {
      await this.updateCart({
        billing: {
          method: 'card',
          card: paymentMethod,
        },
      });

      return this.onSuccess();
    }

    const intent = await this._createIntent(cart, paymentMethod);

    await this.updateCart({
      billing: {
        method: 'card',
        card: paymentMethod,
        intent: {
          stripe: {
            id: intent.id,
            ...(Boolean(cart.auth_total) && {
              auth_amount: cart.auth_total,
            }),
          },
        },
      },
    });

    this.onSuccess();
  }

  async authenticate(payment) {
    const { transaction_id: id, card: { token } = {} } = payment;
    const intent = await this.updateIntent({
      gateway: 'stripe',
      intent: { id, payment_method: token },
    });

    if (intent.error) {
      throw new Error(intent.error.message);
    }

    return this._confirmCardPayment(intent);
  }

  async _createIntent(cart, paymentMethod) {
    const { account, currency, capture_total, auth_total } = cart;
    const stripeCustomer = account && account.stripe_customer;
    const stripeCurrency = (currency || 'USD').toLowerCase();
    const amount = stripeAmountByCurrency(currency, capture_total + auth_total);
    const intent = await this.createIntent({
      gateway: 'stripe',
      intent: {
        amount,
        currency: stripeCurrency,
        payment_method: paymentMethod.token,
        capture_method: 'manual',
        setup_future_usage: 'off_session',
        ...(stripeCustomer ? { customer: stripeCustomer } : {}),
      },
    });

    if (!intent) {
      throw new Error('Stripe payment intent is not defined');
    }

    if (
      !['requires_capture', 'requires_confirmation'].includes(intent.status)
    ) {
      throw new Error(`Unsupported intent status: ${intent.status}`);
    }

    // Confirm the payment intent
    if (intent.status === 'requires_confirmation') {
      await this._confirmCardPayment(intent);
    }

    return intent;
  }

  async _confirmCardPayment(intent) {
    const actionResult = await this.stripe.confirmCardPayment(
      intent.client_secret,
    );

    if (actionResult.error) {
      throw new Error(actionResult.error.message);
    }

    return { status: actionResult.status };
  }
}

class StripeIDealPayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.ideal,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeIDealPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeIDealPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeIDealPayment.stripe;
  }

  set stripe(stripe) {
    StripeIDealPayment.stripe = stripe;
  }

  get stripeElement() {
    return StripeIDealPayment.stripeElement;
  }

  set stripeElement(stripeElement) {
    StripeIDealPayment.stripeElement = stripeElement;
  }

  async createElements() {
    const elements = this.stripe.elements(this.params.config);

    this.stripeElement = createElement('idealBank', elements, this.params);
  }

  async tokenize() {
    if (!this.stripeElement) {
      throw new Error('Stripe payment element is not defined');
    }

    const cart = await this.getCart();
    const { paymentMethod, error: paymentMethodError } =
      await createIDealPaymentMethod(this.stripe, this.stripeElement, cart);

    if (paymentMethodError) {
      throw new Error(paymentMethodError.message);
    }

    const intent = await this._createIntent(cart, paymentMethod);

    await this.stripe.handleCardAction(intent.client_secret);
  }

  async _createIntent(cart, paymentMethod) {
    const { currency, capture_total } = cart;
    const stripeCurrency = (currency || 'EUR').toLowerCase();
    const amount = stripeAmountByCurrency(currency, capture_total);
    const intent = await this.createIntent({
      gateway: 'stripe',
      intent: {
        amount,
        currency: stripeCurrency,
        payment_method: paymentMethod.id,
        payment_method_types: 'ideal',
        confirmation_method: 'manual',
        confirm: true,
        return_url: window.location.href,
      },
    });

    if (!intent) {
      throw new Error('Stripe payment intent is not defined');
    }

    if (
      !['requires_action', 'requires_source_action'].includes(intent.status)
    ) {
      throw new Error(`Unsupported intent status (${intent.status})`);
    }

    await this.updateCart({
      billing: {
        method: 'ideal',
        ideal: {
          token: paymentMethod.id,
        },
        intent: {
          stripe: {
            id: intent.id,
          },
        },
      },
    });

    return intent;
  }
}

class StripeBancontactPayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.bancontact,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeBancontactPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeBancontactPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeBancontactPayment.stripe;
  }

  set stripe(stripe) {
    StripeBancontactPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const { source, error: sourceError } = await createBancontactSource(
      this.stripe,
      cart,
    );

    if (sourceError) {
      throw new Error(sourceError.message);
    }

    await this.updateCart({
      billing: {
        method: 'bancontact',
      },
    });

    window.location.replace(source.redirect.url);
  }
}

class StripeKlarnaPayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.klarna,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeKlarnaPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeKlarnaPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeKlarnaPayment.stripe;
  }

  set stripe(stripe) {
    StripeKlarnaPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const { source, error: sourceError } = await createKlarnaSource(
      this.stripe,
      cart,
    );

    if (sourceError) {
      throw new Error(sourceError.message);
    }

    await this.updateCart({
      billing: {
        method: 'klarna',
      },
    });

    window.location.replace(source.redirect.url);
  }
}

const VERSION$1 = '2018-10-31';
const API_VERSION$1 = 2;
const API_MINOR_VERSION$1 = 0;
const ALLOWED_CARD_AUTH_METHODS$1 = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
const ALLOWED_CARD_NETWORKS$1 = [
  'AMEX',
  'DISCOVER',
  'INTERAC',
  'JCB',
  'MASTERCARD',
  'VISA',
];

class StripeGooglePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.google,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['google-pay'];
  }

  get google() {
    if (!window.google) {
      throw new LibraryNotLoadedError('Google');
    }

    return window.google;
  }

  get googleClient() {
    if (!StripeGooglePayment.googleClient) {
      if (this.google) {
        this.googleClient = new this.google.payments.api.PaymentsClient({
          environment: isLiveMode(this.method.mode) ? 'PRODUCTION' : 'TEST',
        });
      }

      if (!StripeGooglePayment.googleClient) {
        throw new LibraryNotLoadedError('Google client');
      }
    }

    return StripeGooglePayment.googleClient;
  }

  set googleClient(googleClient) {
    StripeGooglePayment.googleClient = googleClient;
  }

  get tokenizationSpecification() {
    const publishableKey = this.method.publishable_key;

    if (!publishableKey) {
      throw new Error('Stripe publishable key is not defined');
    }

    return {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'stripe',
        'stripe:version': VERSION$1,
        'stripe:publishableKey': publishableKey,
      },
    };
  }

  get cardPaymentMethod() {
    return {
      type: 'CARD',
      tokenizationSpecification: this.tokenizationSpecification,
      parameters: {
        allowedAuthMethods: ALLOWED_CARD_AUTH_METHODS$1,
        allowedCardNetworks: ALLOWED_CARD_NETWORKS$1,
        billingAddressRequired: true,
        billingAddressParameters: {
          format: 'FULL',
          phoneNumberRequired: true,
        },
      },
    };
  }

  get allowedPaymentMethods() {
    return [this.cardPaymentMethod];
  }

  async createElements() {
    if (!this.method.merchant_id) {
      throw new Error('Google merchant ID is not defined');
    }

    const isReadyToPay = await this.googleClient.isReadyToPay({
      apiVersion: API_VERSION$1,
      apiVersionMinor: API_MINOR_VERSION$1,
      allowedPaymentMethods: this.allowedPaymentMethods,
      existingPaymentMethodRequired: true,
    });

    if (!isReadyToPay.result) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    const cart = await this.getCart();
    const paymentRequestData = this._createPaymentRequestData(cart);

    this._renderButton(paymentRequestData);
  }

  _createPaymentRequestData(cart) {
    const {
      settings: { name },
      capture_total,
      currency,
    } = cart;
    const { require: { email, shipping, phone } = {} } = this.params;

    return {
      apiVersion: API_VERSION$1,
      apiVersionMinor: API_MINOR_VERSION$1,
      transactionInfo: {
        currencyCode: currency,
        totalPrice: capture_total.toString(),
        totalPriceStatus: 'ESTIMATED',
      },
      allowedPaymentMethods: this.allowedPaymentMethods,
      emailRequired: Boolean(email),
      shippingAddressRequired: Boolean(shipping),
      shippingAddressParameters: {
        phoneNumberRequired: Boolean(phone),
      },
      merchantInfo: {
        merchantName: name,
        merchantId: this.method.merchant_id,
      },
    };
  }

  _renderButton(paymentRequestData) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      style: { color = 'black', type = 'buy', sizeMode = 'fill' } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    if (classes.base) {
      container.classList.add(classes.base);
    }

    const button = this.googleClient.createButton({
      buttonColor: color,
      buttonType: type,
      buttonSizeMode: sizeMode,
      buttonLocale: locale,
      onClick: this._onClick.bind(this, paymentRequestData),
    });

    container.appendChild(button);
  }

  async _onClick(paymentRequestData) {
    try {
      const paymentData = await this.googleClient.loadPaymentData(
        paymentRequestData,
      );

      if (paymentData) {
        await this._submitPayment(paymentData);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  async _submitPayment(paymentData) {
    const { require: { shipping: requireShipping } = {} } = this.params;
    const { email, shippingAddress, paymentMethodData } = paymentData;
    const {
      info: { billingAddress },
      tokenizationData,
    } = paymentMethodData;
    const token = JSON.parse(tokenizationData.token);
    const { card } = token;

    await this.updateCart({
      account: {
        email,
      },
      billing: {
        method: 'card',
        card: {
          token: token.id,
          brand: card.brand,
          last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          gateway: 'stripe',
        },
        ...this._mapAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: this._mapAddress(shippingAddress),
      }),
    });

    this.onSuccess();
  }

  _mapAddress(address) {
    return {
      name: address.name,
      address1: address.address1,
      address2: address.address2,
      city: address.locality,
      state: address.administrativeArea,
      zip: address.postalCode,
      country: address.countryCode,
      phone: address.phoneNumber,
    };
  }
}

class StripeApplePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.apple,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeApplePayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeApplePayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeApplePayment.stripe;
  }

  set stripe(stripe) {
    StripeApplePayment.stripe = stripe;
  }

  async createElements() {
    await this._authorizeDomain();

    const cart = await this.getCart();
    const paymentRequest = this._createPaymentRequest(cart);
    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment || !canMakePayment.applePay) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    this._renderButton(paymentRequest);
  }

  async _authorizeDomain() {
    const domain = window.location.hostname;
    const authorization = await this.authorizeGateway({
      gateway: 'stripe',
      params: {
        applepay_domain: domain,
      },
    });

    if (!authorization) {
      throw new Error(`${domain} domain is not verified`);
    }
  }

  _createPaymentRequest(cart) {
    const { require: { name, email, shipping, phone } = {} } = this.params;

    const paymentRequest = this.stripe.paymentRequest({
      requestPayerName: Boolean(name),
      requestPayerEmail: Boolean(email),
      requestPayerPhone: Boolean(phone),
      requestShipping: Boolean(shipping),
      disableWallets: ['googlePay', 'browserCard', 'link'],
      ...this._getPaymentRequestData(cart),
    });

    paymentRequest.on(
      'shippingaddresschange',
      this._onShippingAddressChange.bind(this),
    );
    paymentRequest.on(
      'shippingoptionchange',
      this._onShippingOptionChange.bind(this),
    );
    paymentRequest.on('paymentmethod', this._onPaymentMethod.bind(this));

    return paymentRequest;
  }

  _renderButton(paymentRequest) {
    const {
      elementId = 'applepay-button',
      style: { type = 'default', theme = 'dark', height = '40px' } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    const button = this.stripe.elements().create('paymentRequestButton', {
      paymentRequest,
      style: {
        paymentRequestButton: {
          type,
          theme,
          height,
        },
      },
      classes,
    });

    button.mount(`#${elementId}`);
  }

  _getPaymentRequestData(cart) {
    const {
      currency,
      shipping,
      items,
      capture_total,
      shipment_rating,
      shipment_total,
      tax_included_total,
      settings,
    } = cart;

    const stripeCurrency = currency.toLowerCase();
    const displayItems = items.map((item) => ({
      label: item.product.name,
      amount: stripeAmountByCurrency(
        currency,
        item.price_total - item.discount_total,
      ),
    }));

    if (tax_included_total) {
      displayItems.push({
        label: 'Taxes',
        amount: stripeAmountByCurrency(currency, tax_included_total),
      });
    }

    if (shipping.price && shipment_total) {
      displayItems.push({
        label: shipping.service_name,
        amount: stripeAmountByCurrency(currency, shipment_total),
      });
    }

    const services = shipment_rating && shipment_rating.services;
    let shippingOptions;
    if (services) {
      shippingOptions = services.map((service) => ({
        id: service.id,
        label: service.name,
        detail: service.description,
        amount: stripeAmountByCurrency(currency, service.price),
      }));
    }

    return {
      country: settings.country,
      currency: stripeCurrency,
      total: {
        label: settings.name,
        amount: stripeAmountByCurrency(currency, capture_total),
        pending: true,
      },
      displayItems,
      shippingOptions,
    };
  }

  async _onShippingAddressChange(event) {
    const { shippingAddress, updateWith } = event;
    const shipping = this._mapShippingAddress(shippingAddress);
    const cart = await this.updateCart({
      shipping: { ...shipping, service: null },
      shipment_rating: null,
    });

    if (cart) {
      updateWith({ status: 'success', ...this._getPaymentRequestData(cart) });
    } else {
      updateWith({ status: 'invalid_shipping_address' });
    }
  }

  async _onShippingOptionChange(event) {
    const { shippingOption, updateWith } = event;
    const cart = await this.updateCart({
      shipping: { service: shippingOption.id },
    });

    if (cart) {
      updateWith({ status: 'success', ...this._getPaymentRequestData(cart) });
    } else {
      updateWith({ status: 'fail' });
    }
  }

  async _onPaymentMethod(event) {
    const {
      payerEmail,
      paymentMethod: { id: paymentMethod, card, billing_details },
      shippingAddress,
      shippingOption,
      complete,
    } = event;
    const { require: { shipping: requireShipping } = {} } = this.params;

    await this.updateCart({
      account: {
        email: payerEmail,
      },
      ...(requireShipping && {
        shipping: {
          ...this._mapShippingAddress(shippingAddress),
          service: shippingOption.id,
        },
      }),
      billing: {
        ...this._mapBillingAddress(billing_details),
        method: 'card',
        card: {
          gateway: 'stripe',
          token: paymentMethod,
          brand: card.brand,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          last4: card.last4,
          address_check: card.checks.address_line1_check,
          zip_check: card.checks.address_postal_code_check,
          cvc_check: card.checks.cvc_check,
        },
      },
    });

    complete('success');

    this.onSuccess();
  }

  _mapShippingAddress(address = {}) {
    return {
      name: address.recipient,
      address1: address.addressLine[0],
      address2: address.addressLine[1],
      city: address.city,
      state: address.region,
      zip: address.postalCode,
      country: address.country,
      phone: address.phone,
    };
  }

  _mapBillingAddress(address = {}) {
    return {
      name: address.name,
      phone: address.phone,
      address1: address.address.line1,
      address2: address.address.line2,
      city: address.address.city,
      state: address.address.state,
      zip: address.address.postal_code,
      country: address.address.country,
    };
  }
}

class BraintreePaypalPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id, merchant_id } = this.method;

    return [
      { id: 'braintree-paypal-sdk', params: { client_id, merchant_id } },
      'braintree-web',
      'braintree-web-paypal-checkout',
    ];
  }

  get paypal() {
    if (!window.paypal) {
      throw new LibraryNotLoadedError('PayPal');
    }

    return window.paypal;
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get braintreePaypalCheckout() {
    if (!this.braintree.paypalCheckout) {
      throw new LibraryNotLoadedError('Braintree PayPal Checkout');
    }

    return this.braintree.paypalCheckout;
  }

  async createElements() {
    const cart = await this.getCart();
    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    const braintreeClient = await this.braintree.client.create({
      authorization,
    });
    const paypalCheckout = await this.braintreePaypalCheckout.create({
      client: braintreeClient,
    });
    const button = this.paypal.Buttons({
      style: this.params.style || {},
      createBillingAgreement: this._onCreateBillingAgreement.bind(
        this,
        paypalCheckout,
        cart,
      ),
      onApprove: this._onApprove.bind(this, paypalCheckout),
      onCancel: this.onCancel.bind(this),
      onError: this.onError.bind(this),
    });

    button.render(this.params.elementId || '#paypal-button');
  }

  _onCreateBillingAgreement(paypalCheckout, cart) {
    return paypalCheckout.createPayment({
      flow: 'vault',
      currency: cart.currency,
      amount: cart.capture_total,
    });
  }

  async _onApprove(paypalCheckout, data, actions) {
    const { nonce } = await paypalCheckout.tokenizePayment(data);

    await this.updateCart({
      billing: {
        method: 'paypal',
        paypal: {
          nonce,
        },
      },
    });

    this.onSuccess(data, actions);
  }
}

const API_VERSION = 2;
const API_MINOR_VERSION = 0;
const ALLOWED_CARD_AUTH_METHODS = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
const ALLOWED_CARD_NETWORKS = [
  'AMEX',
  'DISCOVER',
  'INTERAC',
  'JCB',
  'MASTERCARD',
  'VISA',
];

class BraintreeGooglePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(request, options, params, methods.google);
  }

  get scripts() {
    return ['google-pay', 'braintree-web', 'braintree-google-payment'];
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get google() {
    if (!window.google) {
      throw new LibraryNotLoadedError('Google');
    }

    return window.google;
  }

  get googleClient() {
    if (!BraintreeGooglePayment.googleClient) {
      if (this.google) {
        this.googleClient = new this.google.payments.api.PaymentsClient({
          environment: isLiveMode(this.method.mode) ? 'PRODUCTION' : 'TEST',
        });
      }

      if (!BraintreeGooglePayment.googleClient) {
        throw new LibraryNotLoadedError('Google client');
      }
    }

    return BraintreeGooglePayment.googleClient;
  }

  set googleClient(googleClient) {
    BraintreeGooglePayment.googleClient = googleClient;
  }

  get cardPaymentMethod() {
    return {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ALLOWED_CARD_AUTH_METHODS,
        allowedCardNetworks: ALLOWED_CARD_NETWORKS,
        billingAddressRequired: true,
        billingAddressParameters: {
          format: 'FULL',
          phoneNumberRequired: true,
        },
      },
    };
  }

  get allowedPaymentMethods() {
    return [this.cardPaymentMethod];
  }

  async createElements() {
    if (!this.method.merchant_id) {
      throw new Error('Google merchant ID is not defined');
    }

    const isReadyToPay = await this.googleClient.isReadyToPay({
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      allowedPaymentMethods: this.allowedPaymentMethods,
      existingPaymentMethodRequired: true,
    });

    if (!isReadyToPay.result) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    const braintreeClient = await this._createBraintreeClient();
    const googlePayment = await this.braintree.googlePayment.create({
      client: braintreeClient,
      googleMerchantId: this.method.merchant_id,
      googlePayVersion: API_VERSION,
    });
    const cart = await this.getCart();
    const paymentRequestData = this._createPaymentRequestData(cart);
    const paymentDataRequest =
      googlePayment.createPaymentDataRequest(paymentRequestData);

    this._renderButton(googlePayment, paymentDataRequest);
  }

  async _createBraintreeClient() {
    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    return this.braintree.client.create({
      authorization,
    });
  }

  _createPaymentRequestData(cart) {
    const {
      settings: { name },
      capture_total,
      currency,
    } = cart;
    const { require: { email, shipping, phone } = {} } = this.params;

    return {
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      transactionInfo: {
        currencyCode: currency,
        totalPrice: capture_total.toString(),
        totalPriceStatus: 'ESTIMATED',
      },
      allowedPaymentMethods: this.allowedPaymentMethods,
      emailRequired: Boolean(email),
      shippingAddressRequired: Boolean(shipping),
      shippingAddressParameters: {
        phoneNumberRequired: Boolean(phone),
      },
      merchantInfo: {
        merchantName: name,
        merchantId: this.method.merchant_id,
      },
    };
  }

  _renderButton(googlePayment, paymentDataRequest) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      style: { color = 'black', type = 'buy', sizeMode = 'fill' } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    if (classes.base) {
      container.classList.add(classes.base);
    }

    const button = this.googleClient.createButton({
      buttonColor: color,
      buttonType: type,
      buttonSizeMode: sizeMode,
      buttonLocale: locale,
      onClick: this._onClick.bind(this, googlePayment, paymentDataRequest),
    });

    container.appendChild(button);
  }

  async _onClick(googlePayment, paymentDataRequest) {
    try {
      const paymentData = await this.googleClient.loadPaymentData(
        paymentDataRequest,
      );

      if (paymentData) {
        await this._submitPayment(googlePayment, paymentData);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  async _submitPayment(googlePayment, paymentData) {
    const { require: { shipping: requireShipping } = {} } = this.params;
    const { nonce } = await googlePayment.parseResponse(paymentData);
    const { email, shippingAddress, paymentMethodData } = paymentData;
    const {
      info: { billingAddress },
    } = paymentMethodData;

    await this.updateCart({
      account: {
        email,
      },
      billing: {
        method: 'google',
        google: {
          nonce,
          gateway: 'braintree',
        },
        ...this._mapAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: this._mapAddress(shippingAddress),
      }),
    });

    this.onSuccess();
  }

  _mapAddress(address) {
    return {
      name: address.name,
      address1: address.address1,
      address2: address.address2,
      city: address.locality,
      state: address.administrativeArea,
      zip: address.postalCode,
      country: address.countryCode,
      phone: address.phoneNumber,
    };
  }
}

const VERSION = 3;
const MERCHANT_CAPABILITIES = [
  'supports3DS',
  'supportsDebit',
  'supportsCredit',
];

class BraintreeApplePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(request, options, params, methods.apple);
  }

  get scripts() {
    return ['braintree-web', 'braintree-apple-payment'];
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get ApplePaySession() {
    if (!window.ApplePaySession) {
      throw new LibraryNotLoadedError('Apple');
    }

    return window.ApplePaySession;
  }

  async createElements() {
    if (!this.ApplePaySession.canMakePayments()) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    const cart = await this.getCart();
    const braintreeClient = await this._createBraintreeClient();
    const applePayment = await this.braintree.applePay.create({
      client: braintreeClient,
    });
    const paymentRequest = await this._createPaymentRequest(cart, applePayment);

    this._renderButton(applePayment, paymentRequest);
  }

  _renderButton(applePayment, paymentRequest) {
    const {
      elementId = 'applepay-button',
      style: { type = 'plain', theme = 'black', height = '40px' } = {},
      classes = {},
    } = this.params;
    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    if (classes.base) {
      container.classList.add(classes.base);
    }

    const button = document.createElement('div');

    button.style.appearance = '-apple-pay-button';
    button.style['-apple-pay-button-type'] = type;
    button.style['-apple-pay-button-style'] = theme;
    button.style.height = height;

    button.addEventListener(
      'click',
      this._createPaymentSession.bind(this, applePayment, paymentRequest),
    );

    container.appendChild(button);
  }

  async _createBraintreeClient() {
    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    return this.braintree.client.create({
      authorization,
    });
  }

  _createPaymentRequest(cart, applePayment) {
    const { require = {} } = this.params;
    const {
      settings: { name },
      capture_total,
      currency,
    } = cart;

    const requiredShippingContactFields = [];
    const requiredBillingContactFields = ['postalAddress'];

    if (require.name) {
      requiredShippingContactFields.push('name');
    }
    if (require.email) {
      requiredShippingContactFields.push('email');
    }
    if (require.phone) {
      requiredShippingContactFields.push('phone');
    }
    if (require.shipping) {
      requiredShippingContactFields.push('postalAddress');
    }

    return applePayment.createPaymentRequest({
      total: {
        label: name,
        type: 'pending',
        amount: capture_total.toString(),
      },
      currencyCode: currency,
      merchantCapabilities: MERCHANT_CAPABILITIES,
      requiredShippingContactFields,
      requiredBillingContactFields,
    });
  }

  _createPaymentSession(applePayment, paymentRequest) {
    const session = new this.ApplePaySession(VERSION, paymentRequest);

    session.onvalidatemerchant = async (event) => {
      const merchantSession = await applePayment
        .performValidation({
          validationURL: event.validationURL,
          displayName: paymentRequest.total.label,
        })
        .catch(this.onError.bind(this));

      if (merchantSession) {
        session.completeMerchantValidation(merchantSession);
      } else {
        session.abort();
      }
    };

    session.onpaymentauthorized = async (event) => {
      const {
        payment: { token, shippingContact, billingContact },
      } = event;
      const { require: { shipping: requireShipping } = {} } = this.params;
      const payload = await applePayment
        .tokenize({ token })
        .catch(this.onError.bind(this));

      if (!payload) {
        return session.completePayment(this.ApplePaySession.STATUS_FAILURE);
      }

      await this.updateCart({
        account: {
          email: shippingContact.emailAddress,
        },
        billing: {
          method: 'apple',
          apple: {
            nonce: payload.nonce,
            gateway: 'braintree',
          },
          ...this._mapAddress(billingContact),
        },
        ...(requireShipping && {
          shipping: this._mapAddress(shippingContact),
        }),
      });

      this.onSuccess();

      return session.completePayment(this.ApplePaySession.STATUS_SUCCESS);
    };

    session.begin();
  }

  _mapAddress(address = {}) {
    return {
      first_name: address.givenName,
      last_name: address.familyName,
      address1: address.addressLines[0],
      address2: address.addressLines[1],
      city: address.locality,
      state: address.administrativeArea,
      zip: address.postalCode,
      country: address.countryCode,
      phone: address.phoneNumber,
    };
  }
}

class QuickpayCardPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.card);
  }

  get orderId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async tokenize() {
    const cart = await this.getCart();
    const intent = await this.createIntent({
      gateway: 'quickpay',
      intent: {
        order_id: this.orderId,
        currency: cart.currency || 'USD',
      },
    });

    await this.updateCart({
      billing: {
        method: 'card',
        intent: {
          quickpay: {
            id: intent,
          },
        },
      },
    });

    const returnUrl = window.location.origin + window.location.pathname;
    const authorization = await this.authorizeGateway({
      gateway: 'quickpay',
      params: {
        action: 'create',
        continueurl: `${returnUrl}?gateway=quickpay&redirect_status=succeeded`,
        cancelurl: `${returnUrl}?gateway=quickpay&redirect_status=canceled`,
      },
    });

    if (authorization && authorization.url) {
      window.location.replace(authorization.url);
    }
  }

  async handleRedirect(queryParams) {
    const { redirect_status: status, card_id: id } = queryParams;

    switch (status) {
      case 'succeeded':
        return this._handleSuccessfulRedirect(id);
      case 'canceled':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${status}`);
    }
  }

  async _handleSuccessfulRedirect(cardId) {
    const card = await this.authorizeGateway({
      gateway: 'quickpay',
      params: { action: 'get', id: cardId },
    });

    if (card.error) {
      throw new Error(card.error.message);
    }

    await this.updateCart({
      billing: {
        method: 'card',
        card,
      },
    });

    this.onSuccess();
  }
}

function createPaysafecardPaymentData(cart) {
  const returnUrl = window.location.origin + window.location.pathname;
  const url = `${returnUrl}?gateway=paysafecard`;

  return {
    type: 'PAYSAFECARD',
    amount: cart.capture_total,
    redirect: {
      success_url: url,
      failure_url: url,
    },
    notification_url: url,
    customer: {
      id: get(cart, 'account.id'),
    },
    currency: get(cart, 'currency', 'USD'),
  };
}

class PaysafecardDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paysafecard);
  }

  async tokenize() {
    const cart = await this.getCart();
    const intentData = createPaysafecardPaymentData(cart);
    const intent = await this.createIntent({
      gateway: 'paysafecard',
      intent: intentData,
    });

    if (!intent) {
      throw new Error('Paysafecard payment is not defined');
    }

    await this.updateCart({
      billing: {
        method: 'paysafecard',
        intent: {
          paysafecard: {
            id: intent.id,
          },
        },
      },
    });

    window.location.replace(intent.redirect.auth_url);
  }

  async handleRedirect() {
    const cart = await this.getCart();
    const paymentId = get(cart, 'billing.intent.paysafecard.id');

    if (!paymentId) {
      throw new Error('Paysafecard payment ID is not defined');
    }

    const intent = await this.updateIntent({
      gateway: 'paysafecard',
      intent: { payment_id: paymentId },
    });

    if (!intent) {
      throw new Error('Paysafecard payment is not defined');
    }

    switch (intent.status) {
      case 'SUCCESS':
      case 'AUTHORIZED':
        return this.onSuccess();
      case 'CANCELED_CUSTOMER':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${intent.status}.`);
    }
  }
}

const addressFieldsMap = {
  given_name: 'first_name',
  family_name: 'last_name',
  city: 'city',
  country: 'country',
  phone: 'phone',
  postal_code: 'zip',
  street_address: 'address1',
  street_address2: 'address2',
  region: 'state',
};

const mapFields = (fieldsMap, data) =>
  reduce(
    fieldsMap,
    (acc, srcKey, destKey) => {
      const value = data[srcKey];
      if (value) {
        acc[destKey] = value;
      }
      return acc;
    },
    {},
  );

const mapAddressFields = (cart, addressField) => ({
  ...mapFields(addressFieldsMap, cart[addressField]),
  email: get(cart, 'account.email'),
});

function getOrderLines(cart) {
  const items = map(cart.items, (item) => ({
    type: 'physical',
    name: get(item, 'product.name'),
    reference: get(item, 'product.sku') || get(item, 'product.slug'),
    quantity: item.quantity,
    unit_price: Math.round(toNumber(item.price - item.discount_each) * 100),
    total_amount: Math.round(
      toNumber(item.price_total - item.discount_total) * 100,
    ),
    tax_rate: 0,
    total_tax_amount: 0,
  }));

  const tax = get(cart, 'tax_included_total');
  const taxAmount = toNumber(tax) * 100;
  if (tax) {
    items.push({
      type: 'sales_tax',
      name: 'Taxes',
      quantity: 1,
      unit_price: taxAmount,
      total_amount: taxAmount,
      tax_rate: 0,
      total_tax_amount: 0,
    });
  }

  const shipping = get(cart, 'shipping', {});
  const shippingTotal = get(cart, 'shipment_total', {});
  const shippingAmount = toNumber(shippingTotal) * 100;
  if (shipping.price) {
    items.push({
      type: 'shipping_fee',
      name: shipping.service_name,
      quantity: 1,
      unit_price: shippingAmount,
      total_amount: shippingAmount,
      tax_rate: 0,
      total_tax_amount: 0,
    });
  }

  return items;
}

function getKlarnaSessionData(cart) {
  const returnUrl = `${window.location.origin}${window.location.pathname}?gateway=klarna_direct&sid={{session_id}}`;
  const successUrl = `${returnUrl}&authorization_token={{authorization_token}}`;

  return {
    locale: cart.display_locale || get(cart, 'settings.locale') || 'en-US',
    purchase_country:
      get(cart, 'billing.country') || get(cart, 'shipping.country'),
    purchase_currency: cart.currency,
    billing_address: mapAddressFields(cart, 'billing'),
    shipping_address: mapAddressFields(cart, 'shipping'),
    order_amount: Math.round(get(cart, 'capture_total', 0) * 100),
    order_lines: JSON.stringify(getOrderLines(cart)),
    merchant_urls: {
      success: successUrl,
      back: returnUrl,
      cancel: returnUrl,
      error: returnUrl,
      failure: returnUrl,
    },
  };
}

class KlarnaDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.klarna);
  }

  async tokenize() {
    const cart = await this.getCart();
    const sessionData = getKlarnaSessionData(cart);
    const session = await this.createIntent({
      gateway: 'klarna',
      intent: sessionData,
    });

    if (!session) {
      throw new Error('Klarna session is not defined');
    }

    window.location.replace(session.redirect_url);
  }

  async handleRedirect(queryParams) {
    const { authorization_token } = queryParams;

    if (!authorization_token) {
      throw new UnableAuthenticatePaymentMethodError();
    }

    await this.updateCart({
      billing: {
        method: 'klarna',
        klarna: {
          token: authorization_token,
        },
      },
    });

    this.onSuccess();
  }
}

class PaypalDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id, merchant_id } = this.method;

    return [
      {
        id: 'paypal-sdk',
        params: {
          client_id,
          merchant_id,
          cart: ['currency'],
        },
      },
    ];
  }

  get paypal() {
    if (!window.paypal) {
      throw new LibraryNotLoadedError('PayPal');
    }

    return window.paypal;
  }

  async createElements() {
    const cart = await this.getCart();
    const { locale, style, elementId } = this.params;

    if (!(cart.capture_total > 0)) {
      throw new Error(
        'Invalid PayPal button amount. Value should be greater than zero.',
      );
    }

    const button = this.paypal.Buttons({
      locale: locale || 'en_US',
      style: style || {
        layout: 'horizontal',
        height: 45,
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        tagline: false,
      },
      createOrder: this._onCreateOrder.bind(this, cart),
      onApprove: this._onApprove.bind(this, cart),
      onError: this.onError.bind(this),
    });

    button.render(elementId || '#paypal-button');
  }

  _onCreateOrder(cart, data, actions) {
    const { capture_total, currency } = cart;

    return actions.order.create({
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          amount: {
            value: +capture_total.toFixed(2),
            currency_code: currency,
          },
        },
      ],
    });
  }

  async _onApprove(cart, data, actions) {
    const order = await actions.order.get();
    const orderId = order.id;
    const payer = order.payer;
    const shipping = get(order, 'purchase_units[0].shipping');

    await this.updateCart({
      account: {
        email: payer.email_address,
      },
      billing: {
        method: 'paypal',
        paypal: {
          order_id: orderId,
        },
      },
      shipping: {
        name: shipping.name.full_name,
        address1: shipping.address.address_line_1,
        address2: shipping.address.address_line_2,
        state: shipping.address.admin_area_1,
        city: shipping.address.admin_area_2,
        zip: shipping.address.postal_code,
        country: shipping.address.country_code,
      },
    });

    this.onSuccess();
  }
}

class AmazonDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.amazon);
  }

  get scripts() {
    return ['amazon-checkout'];
  }

  get amazon() {
    if (!window.amazon) {
      throw new LibraryNotLoadedError('Amazon');
    }

    return window.amazon;
  }

  get merchantId() {
    const merchantId = this.method.merchant_id;

    if (!merchantId) {
      throw new MethodPropertyMissingError('Amazon', 'merchant_id');
    }

    return merchantId;
  }

  get publicKeyId() {
    const publicKeyId = this.method.public_key_id;

    if (!publicKeyId) {
      throw new MethodPropertyMissingError('Amazon', 'public_key_id');
    }

    return publicKeyId;
  }

  get returnUrl() {
    return `${
      window.location.origin + window.location.pathname
    }?gateway=amazon`;
  }

  async createElements() {
    const cart = await this.getCart();
    const returnUrl = this.returnUrl;
    const isSubscription = Boolean(cart.subscription_delivery);
    const session = await this.authorizeGateway({
      gateway: 'amazon',
      params: {
        chargePermissionType: isSubscription ? 'Recurring' : 'OneTime',
        ...(isSubscription
          ? {
              recurringMetadata: {
                frequency: {
                  unit: 'Variable',
                  value: '0',
                },
              },
            }
          : {}),
        webCheckoutDetails: {
          checkoutReviewReturnUrl: `${returnUrl}&redirect_status=succeeded`,
          checkoutCancelUrl: `${returnUrl}&redirect_status=canceled`,
        },
      },
    });

    this._renderButton(cart, session);
  }

  async tokenize() {
    const cart = await this.getCart();
    const returnUrl = this.returnUrl;
    const checkoutSessionId = get(cart, 'billing.amazon.checkout_session_id');

    if (!checkoutSessionId) {
      throw new Error(
        'Missing Amazon Pay checkout session ID (billing.amazon.checkout_session_id)',
      );
    }

    const intent = await this.createIntent({
      gateway: 'amazon',
      intent: {
        checkoutSessionId,
        webCheckoutDetails: {
          checkoutResultReturnUrl: `${returnUrl}&confirm=true&redirect_status=succeeded`,
          checkoutCancelUrl: `${returnUrl}&redirect_status=canceled`,
        },
        paymentDetails:
          cart.capture_total > 0
            ? {
                paymentIntent: 'Authorize',
                canHandlePendingAuthorization: true,
                chargeAmount: {
                  amount: cart.capture_total,
                  currencyCode: cart.currency,
                },
              }
            : {
                // Just confirm payment to save payment details when capture total amount is 0.
                // e.g. trial subscription, 100% discount or items.price = 0
                paymentIntent: 'Confirm',
              },
      },
    });

    return window.location.replace(intent.redirect_url);
  }

  async handleRedirect(queryParams) {
    const { redirect_status } = queryParams;

    switch (redirect_status) {
      case 'succeeded':
        return this._handleSuccessfulRedirect(queryParams);
      case 'canceled':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${redirect_status}`);
    }
  }

  _renderButton(cart, session) {
    const amazon = this.amazon;
    const merchantId = this.merchantId;
    const publicKeyId = this.publicKeyId;
    const { payload: payloadJSON, signature } = session;
    const {
      elementId = 'amazonpay-button',
      locale = 'en_US',
      placement = 'Checkout',
      style: { color = 'Gold' } = {},
      require: { shipping: requireShipping } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    amazon.Pay.renderButton(`#${elementId}`, {
      ledgerCurrency: cart.currency,
      checkoutLanguage: locale,
      productType: Boolean(requireShipping) ? 'PayAndShip' : 'PayOnly',
      buttonColor: color,
      placement,
      merchantId,
      publicKeyId,
      createCheckoutSessionConfig: {
        payloadJSON,
        signature,
      },
    });

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  async _handleSuccessfulRedirect(queryParams) {
    const { confirm, amazonCheckoutSessionId } = queryParams;

    if (!confirm) {
      await this.updateCart({
        billing: {
          method: 'amazon',
          amazon: {
            checkout_session_id: amazonCheckoutSessionId,
          },
        },
      });
    }

    this.onSuccess();
  }
}

class PaymentController {
  constructor(request, options) {
    this.request = request;
    this.options = options;
  }

  get(id) {
    return this.request('get', '/payments', id);
  }

  async methods() {
    if (this.methodSettings) {
      return this.methodSettings;
    }

    this.methodSettings = await this.request('get', '/payment/methods');

    return this.methodSettings;
  }

  async createElements(params) {
    this.params = params;

    if (!params) {
      throw new Error('Payment element parameters are not provided');
    }

    this._performPaymentAction('createElements');
  }

  async tokenize(params = this.params) {
    this.params = params;

    if (!this.params) {
      throw new Error('Tokenization parameters are not provided');
    }

    this._performPaymentAction('tokenize');
  }

  async handleRedirect(params = this.params) {
    const queryParams = getLocationParams(window.location);

    if (!queryParams || !queryParams.gateway) {
      return;
    }

    this.params = params;

    if (!params) {
      throw new Error('Redirect parameters are not provided');
    }

    removeUrlParams();
    this._performPaymentAction('handleRedirect', queryParams);
  }

  async authenticate(id) {
    try {
      const payment = await this.get(id);

      if (!payment) {
        throw new Error('Payment not found');
      }

      const { method, gateway } = payment;
      const PaymentClass = this._getPaymentClass(method, gateway);

      if (!PaymentClass) {
        throw new UnsupportedPaymentMethodError(method, gateway);
      }

      const paymentMethods = await this._getPaymentMethods();
      const methodSettings = paymentMethods[method];

      if (!methodSettings) {
        throw new PaymentMethodDisabledError(method);
      }

      const paymentInstance = new PaymentClass(
        this.request,
        this.options,
        null,
        paymentMethods,
      );

      await paymentInstance.loadScripts(paymentInstance.scripts);
      return await paymentInstance.authenticate(payment);
    } catch (error) {
      return { error };
    }
  }

  async createIntent(data) {
    return this._vaultRequest('post', '/intent', data);
  }

  async updateIntent(data) {
    return this._vaultRequest('put', '/intent', data);
  }

  async authorizeGateway(data) {
    return this._vaultRequest('post', '/authorization', data);
  }

  _normalizeParams() {
    if (!this.params) {
      return;
    }

    if (this.params.config) {
      console.warn(
        'Please move the "config" field to the payment method parameters ("card.config" or/and "ideal.config").',
      );

      if (this.params.card) {
        this.params.card.config = this.params.config;
      }

      if (this.params.ideal) {
        this.params.ideal.config = this.params.config;
      }

      delete this.params.config;
    }
  }

  async _getPaymentMethods() {
    const paymentMethods = await methods$2(
      this.request,
      this.options,
    ).payments();

    if (paymentMethods.error) {
      throw new Error(paymentMethods.error);
    }

    return toSnake(paymentMethods);
  }

  async _vaultRequest(method, url, data) {
    const response = await vaultRequest(method, url, data);

    if (response.errors) {
      const param = Object.keys(response.errors)[0];
      const err = new Error(response.errors[param].message || 'Unknown error');
      err.code = 'vault_error';
      err.status = 402;
      err.param = param;
      throw err;
    }

    if (this.options.useCamelCase) {
      return toCamel(response);
    }

    return response;
  }

  async _performPaymentAction(action, ...args) {
    const paymentMethods = await this._getPaymentMethods();

    this._normalizeParams();

    Object.entries(this.params).forEach(([method, params]) => {
      const methodSettings = paymentMethods[method];

      if (!methodSettings) {
        return console.error(new PaymentMethodDisabledError(method));
      }

      const PaymentClass = this._getPaymentClass(
        method,
        methodSettings.gateway,
      );

      if (!PaymentClass) {
        return console.error(
          new UnsupportedPaymentMethodError(method, methodSettings.gateway),
        );
      }

      try {
        const payment = new PaymentClass(
          this.request,
          this.options,
          params,
          paymentMethods,
        );

        payment
          .loadScripts(payment.scripts)
          .then(payment[action].bind(payment, ...args))
          .catch(payment.onError.bind(payment));
      } catch (error) {
        return console.error(error.message);
      }
    });
  }

  _getPaymentClass(method, gateway) {
    switch (method) {
      case 'card':
        return this._getCardPaymentClass(gateway);
      case 'ideal':
        return this._getIDealPaymentClass(gateway);
      case 'bancontact':
        return this._getBancontactPaymentClass(gateway);
      case 'klarna':
        return this._getKlarnaPaymentClass(gateway);
      case 'paysafecard':
        return this._getPaysafecardPaymentClass(gateway);
      case 'paypal':
        return this._getPaypalPaymentClass(gateway);
      case 'google':
        return this._getGooglePaymentClass(gateway);
      case 'apple':
        return this._getApplePaymentClass(gateway);
      case 'amazon':
        return this._getAmazonPaymentClass(gateway);
      default:
        return null;
    }
  }

  _getCardPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeCardPayment;
      case 'quickpay':
        return QuickpayCardPayment;
      default:
        return null;
    }
  }

  _getIDealPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeIDealPayment;
      default:
        return null;
    }
  }

  _getBancontactPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeBancontactPayment;
      default:
        return null;
    }
  }

  _getKlarnaPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeKlarnaPayment;
      case 'klarna':
        return KlarnaDirectPayment;
      default:
        return null;
    }
  }

  _getPaysafecardPaymentClass(gateway) {
    switch (gateway) {
      default:
        return PaysafecardDirectPayment;
    }
  }

  _getPaypalPaymentClass(gateway) {
    switch (gateway) {
      case 'braintree':
        return BraintreePaypalPayment;
      default:
        return PaypalDirectPayment;
    }
  }

  _getGooglePaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeGooglePayment;
      case 'braintree':
        return BraintreeGooglePayment;
      default:
        return null;
    }
  }

  _getApplePaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeApplePayment;
      case 'braintree':
        return BraintreeApplePayment;
      default:
        return null;
    }
  }

  _getAmazonPaymentClass(gateway) {
    switch (gateway) {
      default:
        return AmazonDirectPayment;
    }
  }
}

function methods$1(request, opt) {
  return {
    code: null,
    state: null,

    list() {
      return opt.api.settings.get('store.locales', []);
    },

    async select(locale) {
      this.set(locale);
      setCookie('swell-locale', locale);
      opt.api.settings.locale = locale;
      return await request('put', '/session', { locale });
    },

    selected() {
      if (this.code) {
        return this.code;
      }
      const storeLocale = opt.api.settings.getStoreLocale();
      const cookieLocale = getCookie('swell-locale');
      opt.api.settings.locale = cookieLocale || storeLocale;
      return cookieLocale || storeLocale;
    },

    get() {
      if (!this.code) {
        this.code = this.selected();
      }
      if (!this.state) {
        this.state = this.set(this.code);
      }
      return this.state;
    },

    set(code) {
      this.code = code;
      this.state = find(this.list(), { code }) || {};
      return this.state;
    },
  };
}

const FORMATTERS = {};

function methods(request, opt) {
  return {
    code: null,
    state: null,
    locale: null,

    list() {
      return opt.api.settings.get('store.currencies', []);
    },

    async select(currency) {
      this.set(currency);

      return request('put', '/session', { currency });
    },

    selected() {
      if (!this.code) {
        this.set(
          getCookie('swell-currency') || opt.api.settings.get('store.currency'),
        );
      }

      return this.code;
    },

    get() {
      if (!this.code) {
        this.code = this.selected();
      }
      if (!this.state) {
        this.state = this.set(this.code);
      }
      return this.state;
    },

    set(code = 'USD') {
      this.code = code;
      this.state = find(this.list(), { code }) || { code };

      this.locale = String(
        opt.api.settings.get(
          'store.locale',
          typeof navigator === 'object' ? navigator.language : 'en-US',
        ),
      );

      setCookie('swell-currency', code);

      return this.state;
    },

    format(amount, params = {}) {
      let state = this.get();
      if (params.code && params.code !== state.code) {
        const list = this.list();
        state = find(list, { code: params.code }) || { code: params.code };
      }

      const { code = 'USD', type, decimals, rate } = state;
      const formatCode = params.code || code;
      const formatRate = params.rate || rate;
      const formatLocale = params.locale || this.locale;
      const formatDecimals =
        'decimals' in params ? params.decimals : decimals;
      const { convert = true } = params;

      let formatAmount = amount;
      if (
        convert &&
        (type === 'display' || params.rate) &&
        typeof formatAmount === 'number' &&
        typeof formatRate === 'number'
      ) {
        // Convert the price currency into the display currency
        formatAmount = this.applyRounding(amount * formatRate, state);
      }

      const formatter = this.formatter({
        code: formatCode,
        locale: formatLocale,
        decimals: formatDecimals,
      });
      try {
        if (typeof formatAmount === 'number') {
          return formatter.format(formatAmount);
        } else {
          // Otherwise return the currency symbol only, falling back to '$'
          const symbol = get(formatter.formatToParts(0), '0.value', '$');
          return symbol !== formatCode ? symbol : '';
        }
      } catch (err) {
        console.warn(err);
      }

      return String(amount);
    },

    formatter({ code, locale, decimals }) {
      locale = String(locale || '').replace('_', '-');

      const key = [code, locale, decimals].join('|');

      if (FORMATTERS[key]) {
        return FORMATTERS[key];
      }

      const formatLocales = [];

      if (locale) {
        formatLocales.push(locale);
      }

      formatLocales.push('en-US');

      const formatDecimals =
        typeof decimals === 'number' ? decimals : undefined;

      const props = {
        style: 'currency',
        currency: code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: formatDecimals,
        maximumFractionDigits: formatDecimals,
      };

      try {
        try {
          FORMATTERS[key] = new Intl.NumberFormat(formatLocales, props);
        } catch (err) {
          if (err.message.indexOf('Invalid language tag') >= 0) {
            FORMATTERS[key] = new Intl.NumberFormat('en-US', props);
          }
        }
      } catch (err) {
        console.warn(err);
      }

      return FORMATTERS[key];
    },

    applyRounding(value, config) {
      if (!config || !config.round) {
        return value;
      }

      const scale = config.decimals;
      const fraction =
        config.round_interval === 'fraction' ? config.round_fraction || 0 : 0;

      let roundValue = ~~value;
      let decimalValue = this.round(value, scale);

      if (decimalValue === fraction) {
        return roundValue + decimalValue;
      }

      const diff = this.round(decimalValue - fraction, 1);
      const direction =
        config.round === 'nearest'
          ? diff > 0
            ? diff >= 0.5
              ? 'up'
              : 'down'
            : diff <= -0.5
            ? 'down'
            : 'up'
          : config.round;

      switch (direction) {
        case 'down':
          roundValue =
            roundValue + fraction - (decimalValue > fraction ? 0 : 1);
          break;
        case 'up':
        default:
          roundValue =
            roundValue + fraction + (decimalValue > fraction ? 1 : 0);
          break;
      }

      return this.round(roundValue, scale);
    },

    round,
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
  version: '3.21.6',
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

  cart: methods$8(request, options),

  account: methods$7(request),

  products: methods$9(request, options),

  categories: methods$6(request),

  attributes: methods$a(request),

  subscriptions: methods$5(request),

  invoices: methods$4(request),

  content: methods$3(request, options),

  settings: methods$2(request, options),

  payment: new PaymentController(request, options),

  locale: methods$1(request, options),

  currency: methods(request, options),

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

module.exports = api;
//# sourceMappingURL=swell.cjs.js.map
