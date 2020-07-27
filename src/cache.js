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

let ONCE_TIMER;

const cacheApi = {
  set({ model, id, path, value }, once = false) {
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

    if (once) {
      set(VALUES, `${model}.${id}.counter`, get(VALUES, `${model}.${id}.counter`, -1) + 1);
    }

    // Make sure values have clean refs
    if (VALUES[model][id] !== undefined) {
      VALUES[model][id] = JSON.parse(JSON.stringify(VALUES[model][id]));
    }
  },

  setOnce(details) {
    if (ONCE_TIMER) {
      clearTimeout(ONCE_TIMER);
    }
    ONCE_TIMER = setTimeout(() => ONCE_TIMER = null, 1000);
    return this.set(details, true);
  },

  get(model, id) {
    return get(VALUES, `${model}.${id}.data`);
  },

  getOnce(model, id) {
    const obj = get(VALUES, `${model}.${id}`);

    if (obj) {
      if (obj.counter > 0) {
        obj.counter--;
        if (obj.data && typeof obj.data === 'object') {
          return { ...obj.data };
        }
        return obj.data;
      }
      if (ONCE_TIMER) {
        if (obj.data && typeof obj.data === 'object') {
          return { ...obj.data };
        }
        return obj.data;
      }
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
