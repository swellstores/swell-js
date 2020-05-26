const { get, set, merge, toCamel, getOptions } = require('./utils');

let VALUES = {
  /*
  [model]: {
    [id]: {
      counter,
      data,
    }
  }
*/
};

const cacheApi = {
  set({ model, id, path, value }, once = false) {
    const { useCamelCase } = getOptions();
    if (useCamelCase && value && typeof value === 'object') {
      value = toCamel(value);
    }
    let data = get(VALUES, `${model}.${id}.data`);
    if ((path && data === undefined) || data === null) {
      return;
    }
    data = data || {};
    let mergeData = {};
    if (path) {
      set(mergeData, path || '', value);
    } else {
      mergeData = value;
    }
    data = merge(data, mergeData, { replaceArrays: value instanceof Array });
    set(VALUES, `${model}.${id}.data`, data);
    if (once) {
      set(VALUES, `${model}.${id}.counter`, get(VALUES, `${model}.${id}.counter`, 0) + 1);
    }
    // Make sure values have clean refs
    VALUES[model][id] = JSON.parse(JSON.stringify(VALUES[model][id]));
  },

  setOnce(details) {
    return this.set(details, true);
  },

  get(model, id) {
    return get(VALUES, `${model}.${id}.data`);
  },

  getOnce(model, id) {
    const obj = get(VALUES, `${model}.${id}`);
    if (obj && obj.counter > 0) {
      obj.counter--;
      return { ...obj.data };
    }
  },

  async getSetOnce(model, id, getter) {
    let value = this.getOnce(model, id);
    if (value !== undefined) {
      return value;
    }
    value = await getter();
    this.setOnce({ model, id, value });
    return value;
  },

  clear(model = undefined, id = undefined, path = undefined) {
    if (model) {
      if (id) {
        if (path) {
          set(VALUES, `${model}.${id}.${path}`, undefined);
        } else {
          set(VALUES, `${model}.${id}`, undefined);
        }
      } else {
        set(VALUES, model, undefined);
      }
    } else {
      VALUES = {};
    }
  },
};

module.exports = cacheApi;
