import { d as defaultMethods } from './index-bce8d606.js';
import { c as cacheApi } from './cache-54abc38e.js';

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
