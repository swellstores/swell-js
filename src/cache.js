const { get, set, merge, toCamel, getOptions } = require('./utils');

let VALUES = {
  /*
  [model]: {
    [id]: {
      data,
    }
  }
*/
};

const cacheApi = {
  set({ model, id, path, value }) {
    let data = get(VALUES, `${model}.${id}.data`);

    if (id === null || (path && data === undefined) || data === null) {
      return;
    }

    const { useCamelCase } = getOptions();
    if (useCamelCase && value && typeof value === 'object') {
      value = toCamel(value);
    }

    let mergeData = {};
    if (value instanceof Array) {
      let upData = { ...data };
      set(upData, path || '', value);
      if (useCamelCase) {
        upData = toCamel(upData);
      }
      data = upData;
    } else if (path) {
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

    set(VALUES, `${model}.${id}.data`, data);

    // Make sure values have clean refs
    if (VALUES[model][id] !== undefined) {
      VALUES[model][id] = JSON.parse(JSON.stringify(VALUES[model][id]));
    }
  },

  get(model, id) {
    return get(VALUES, `${model}.${id}.data`);
  },

  getFetch(model, id, fetch) {
    let value = this.get(model, id);
    if (value !== undefined) {
      return value;
    }
    return fetch();
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
