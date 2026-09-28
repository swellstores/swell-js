import { defaultMethods } from './utils';

function methods(api) {
  const { get, list } = defaultMethods(api, '/categories', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return api.cache.getFetch('categories', id, () => get(id, ...args));
    },

    list,
  };
}

export default methods;
