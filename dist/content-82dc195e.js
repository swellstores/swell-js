import { c as cacheApi } from './cache-f2b62a15.js';

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
function methods(request, opt) {
  return {
    get: (type, id, query) => {
      return cacheApi.getFetch(
        `content_${type}`,
        id,
        () => request("get", `/content/${type}`, id, __spreadValues({
          $preview: opt.previewContent
        }, query || {}))
      );
    },
    list: (type, query) => request("get", `/content/${type}`, void 0, query)
  };
}

export { methods as m };
