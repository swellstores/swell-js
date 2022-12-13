import { m as merge, t as toCamel, a as toCamelPath, g as getOptions } from './index-b1ee0b3d.js';
import set from 'lodash/set';
import get from 'lodash/get';

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
const RECORD_TIMEOUT = 5e3;
let VALUES = {};
const cacheApi = {
  options: {
    enabled: true,
    debug: false
  },
  debug(...args) {
    if (this.options.debug) {
      console.log(...args);
    }
  },
  values({ model, id }, setValues = void 0) {
    this.debug("cache.values", ...arguments);
    if (setValues !== void 0) {
      for (let key in setValues) {
        set(VALUES, `${model}.${id}.${key}`, setValues[key]);
      }
      return;
    }
    return get(VALUES, `${model}.${id}`, {});
  },
  preset(details) {
    this.debug("cache.preset", ...arguments);
    const { presets = [] } = this.values(details);
    presets.push(details);
    this.values(details, { presets });
  },
  set(details) {
    this.debug("cache.set", ...arguments);
    let { model, id, path, value } = details;
    let { data = {}, record, presets } = this.values(details);
    if (id === null) {
      return;
    }
    if (record === void 0) {
      return this.preset(details);
    }
    data = merge(record || {}, data);
    const { useCamelCase } = getOptions();
    if (useCamelCase && value && typeof value === "object") {
      value = toCamel(value);
    }
    if (path || value instanceof Array) {
      let upData = __spreadValues({}, data || {});
      let upPath = useCamelCase ? toCamelPath(path) : path;
      set(upData, upPath || "", value);
      data = upData;
    } else if (value && typeof value === "object") {
      data = data || {};
      data = merge(data, value);
    } else {
      data = value;
    }
    this.values(details, { data });
    try {
      const cache = VALUES[model][id];
      if (cache !== void 0) {
        if (cache.data !== void 0) {
          cache.data = JSON.parse(JSON.stringify(cache.data));
        }
        if (cache.record !== void 0) {
          cache.record = JSON.parse(JSON.stringify(cache.record));
        }
      }
    } catch (err) {
    }
  },
  get(model, id) {
    this.debug("cache.get", ...arguments);
    const { data, recordTimer } = this.values({ model, id });
    this.debug("cache.get:data+recordTimer", ...arguments);
    if (recordTimer) {
      return data;
    }
  },
  setRecord(record, details) {
    this.debug("cache.setRecord", ...arguments);
    let { recordTimer, presets } = this.values(details);
    if (recordTimer) {
      clearTimeout(recordTimer);
    }
    recordTimer = setTimeout(() => {
      this.values(details, { record: void 0, recordTimer: void 0 });
    }, RECORD_TIMEOUT);
    this.values(details, {
      record: record !== void 0 ? record : null,
      recordTimer
    });
    if (presets) {
      for (let preset of presets) {
        this.set(preset);
      }
      this.values(details, { presets: void 0 });
    }
    const result = this.get(details.model, details.id);
    return result !== void 0 ? result : record;
  },
  async getFetch(model, id, fetch) {
    if (this.options.enabled) {
      this.debug("cache.getFetch", ...arguments);
      const value = this.get(model, id);
      if (value !== void 0) {
        return value;
      }
    }
    const record = await fetch();
    return this.setRecord(record, { model, id });
  },
  clear(model = void 0, id = void 0) {
    this.debug("cache.clear", ...arguments);
    if (model) {
      if (id) {
        set(VALUES, `${model}.${id}`, void 0);
      } else {
        set(VALUES, model, void 0);
      }
    } else {
      VALUES = {};
    }
  }
};

export { cacheApi as c };
