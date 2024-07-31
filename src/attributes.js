import { defaultMethods } from './utils';
import cache from './cache';

function methods(api) {
  const { get, list } = defaultMethods(api, '/attributes', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cache.getFetch('attributes', id, () => get(id, ...args));
    },

    list,
  };
}

export default methods;
