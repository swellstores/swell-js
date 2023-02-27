import { d as defaultMethods } from './index-cde4db96.js';
import { c as cacheApi } from './cache-e20666f1.js';

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
