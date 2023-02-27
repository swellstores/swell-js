import { d as defaultMethods } from './index-cde4db96.js';
import { c as cacheApi } from './cache-e20666f1.js';

function methods(request) {
  const { get, list } = defaultMethods(request, '/categories', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('categories', id, () => get(id, ...args));
    },

    list,
  };
}

export { methods as m };
