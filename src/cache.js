const { get, set, merge, toCamel, getOptions } = require('./utils');

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
  values({ model, id }, setValues = undefined) {
    if (setValues !== undefined) {
      for (let key in setValues) {
        set(VALUES, `${model}.${id}.${key}`, setValues[key]);
      }
      return;
    }
    return get(VALUES, `${model}.${id}`, {});
  },

  preset(details) {
    const { presets = [] } = this.values(details);
    presets.push(details);
    this.values(details, { presets });
  },

  set(details) {
    let { model, id, path, value } = details;
    let { data = {}, record, presets } = this.values(details);

    if (id === null) {
      return;
    }

    if (record === undefined) {
      return this.preset(details);
    }

    data = merge(record, data);

    const { useCamelCase } = getOptions();
    if (useCamelCase && value && typeof value === 'object') {
      value = toCamel(value);
    }

    let mergeData = {};
    if (value instanceof Array) {
      let upData = { ...(data || {}) };
      set(upData, path || '', value);
      if (useCamelCase) {
        upData = toCamel(upData);
      }
      data = upData;
    } else if (path) {
      data = data || {};
      set(data, path, value);
      // TODO: make sure this is the right approach
      // set(mergeData, path || '', value);
      // if (useCamelCase) {
      //   mergeData = toCamel(mergeData);
      // }
      // data = merge(data, mergeData);
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
    const { data, recordTimer } = this.values({ model, id });
    if (recordTimer) {
      return data;
    }
  },

  setRecord(record, details) {
    let { recordTimer, presets } = this.values(details);

    if (recordTimer) {
      clearTimeout(recordTimer);
    }

    recordTimer = setTimeout(
      () => {
        this.values(details, { record: undefined, recordTimer: undefined });
      },
      RECORD_TIMEOUT,
    );

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
    const value = this.get(model, id);
    if (value !== undefined) {
      return value;
    }
    const record = await fetch();
    return this.setRecord(record, { model, id });
  },

  clear(model = undefined, id = undefined) {
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

module.exports = cacheApi;
