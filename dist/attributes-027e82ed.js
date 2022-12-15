import { d as defaultMethods } from './index-cb377689.js';
import { c as cacheApi } from './cache-94396c7d.js';

function methods(request) {
  const { get, list } = defaultMethods(request, '/attributes', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('attributes', id, () => get(id, ...args));
    },

    list,
  };
}

export { methods as m };
