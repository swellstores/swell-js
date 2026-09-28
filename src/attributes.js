import { defaultMethods } from './utils';

function methods(api) {
  const { get, list } = defaultMethods(api, '/attributes', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return api.cache.getFetch('attributes', id, () => get(id, ...args));
    },

    list,
  };
}

export default methods;
