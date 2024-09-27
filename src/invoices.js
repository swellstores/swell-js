import { defaultMethods } from './utils';
import cache from './cache';

function methods(api) {
  const { get, list } = defaultMethods(api, '/invoices', ['list', 'get']);
  return {
    get: (id, ...args) => {
      return cache.getFetch('invoices', id, () => get(id, ...args));
    },

    list,
  };
}

export default methods;
