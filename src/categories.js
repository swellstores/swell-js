const { defaultMethods } = require('./utils');
const cache = require('./cache');

function methods(request) {
  const { get, list } = defaultMethods(request, '/categories', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cache.getFetch('categories', id, () => get(id, ...args));
    },

    list,
  };
}

module.exports = {
  methods,
};
