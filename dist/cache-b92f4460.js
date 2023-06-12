import { s as set, g as get, m as merge, t as toCamel, i as toCamelPath, h as getOptions } from './index-ca9cb73c.js';

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

export { cacheApi as c };
