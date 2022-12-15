import { d as defaultMethods } from './index-bee7164f.js';
import { c as cacheApi } from './cache-70cd9241.js';

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
