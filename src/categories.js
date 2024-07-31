import { defaultMethods } from './utils';
import cache from './cache';

function methods(api) {
  const { get, list } = defaultMethods(api, '/categories', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cache.getFetch('categories', id, () => get(id, ...args));
    },

    list,
  };
}

export default methods;
