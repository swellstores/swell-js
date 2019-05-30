const qs = require('qs');
const { normalizeKeys } = require('object-keys-normalizer');

function toCamel(obj) {
  return normalizeKeys(obj, 'camel');
}

function toSnake(obj) {
  if (!obj) return;
  // Make a copy to avoid mutating source object
  const objCopy = JSON.parse(JSON.stringify(obj));
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
    encode: false,
  });
}

module.exports = {
  toCamel,
  toSnake,
  trimBoth,
  trimStart,
  trimEnd,
  stringifyQuery,
};
