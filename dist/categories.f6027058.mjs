import { d as defaultMethods } from './index.b29eadc6.mjs';
import { c as cacheApi } from './cache.70033487.mjs';

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
