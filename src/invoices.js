import { defaultMethods } from './utils';

function methods(api) {
  const { get, list } = defaultMethods(api, '/invoices', ['list', 'get']);
  return {
    get: (id, ...args) => {
      return api.cache.getFetch('invoices', id, () => get(id, ...args));
    },

    list,
  };
}

export default methods;
