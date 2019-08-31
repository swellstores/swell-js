"use strict";

var qs = require('qs');

var _require = require('object-keys-normalizer'),
    normalizeKeys = _require.normalizeKeys;

function toCamel(obj) {
  return normalizeKeys(obj, 'camel');
}

function toSnake(obj) {
  if (!obj) return; // Make a copy to avoid mutating source object

  var objCopy = JSON.parse(JSON.stringify(obj));
  return normalizeKeys(objCopy, 'snake');
}

function trimBoth(str) {
  return trimStart(trimEnd(str));
}

function trimStart(str) {
  return str.replace(/^[/]+/, '');
}

function trimEnd(str) {
  return str.replace(/[/]+$/, '');
}

function stringifyQuery(str) {
  return qs.stringify(str, {
    depth: 10,
    encode: false
  });
}

function map(arr, cb) {
  return arr instanceof Array ? arr.map(cb) : [];
}

function reduce(arr, cb, init) {
  return arr instanceof Array ? arr.reduce(cb, init) : init;
}

function isServer() {
  return !(typeof window !== 'undefined' && window.document);
}

function defaultMethods(request, uri, methods) {
  return {
    list: methods.indexOf('list') >= 0 ? function (query) {
      return request('get', uri, undefined, query);
    } : undefined,
    get: methods.indexOf('get') >= 0 ? function (id, query) {
      return request('get', uri, id, query);
    } : undefined
  };
}

module.exports = {
  toCamel: toCamel,
  toSnake: toSnake,
  trimBoth: trimBoth,
  trimStart: trimStart,
  trimEnd: trimEnd,
  stringifyQuery: stringifyQuery,
  isServer: isServer,
  map: map,
  reduce: reduce,
  defaultMethods: defaultMethods
};