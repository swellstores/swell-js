import { get, set, merge, toCamel, toCamelPath, getOptions } from './utils';

const DEBUG = false; // true to enable debug logs

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

function debug(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

const cacheApi = {
  values({ model, id }, setValues = undefined) {
    debug('cache.values', ...arguments);
    if (setValues !== undefined) {
      for (let key in setValues) {
        set(VALUES, `${model}.${id}.${key}`, setValues[key]);
      }
      return;
    }
    return get(VALUES, `${model}.${id}`, {});
  },

  preset(details) {
    debug('cache.preset', ...arguments);
    const { presets = [] } = this.values(details);
    presets.push(details);
    this.values(details, { presets });
  },

  set(details) {
    debug('cache.set', ...arguments);
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

    // Make sure values have clean refs
    if (VALUES[model][id] !== undefined) {
      VALUES[model][id] = JSON.parse(JSON.stringify(VALUES[model][id]));
    }
  },

  get(model, id) {
    debug('cache.get', ...arguments);
    const { data, recordTimer } = this.values({ model, id });
    debug('cache.get:data+recordTimer', ...arguments);
    if (recordTimer) {
      return data;
    }
  },

  setRecord(record, details) {
    debug('cache.setRecord', ...arguments);
    let { recordTimer, presets } = this.values(details);

    if (recordTimer) {
      clearTimeout(recordTimer);
    }

    recordTimer = setTimeout(() => {
      this.values(details, { record: undefined, recordTimer: undefined });
    }, RECORD_TIMEOUT);

    // Record has to be an empty object at minimum
    this.values(details, { record, recordTimer });

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
    debug('cache.getFetch', ...arguments);
    const value = this.get(model, id);
    if (value !== undefined) {
      return value;
    }
    const record = await fetch();
    return this.setRecord(record, { model, id });
  },

  clear(model = undefined, id = undefined) {
    debug('cache.clear', ...arguments);
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

export default cacheApi;
