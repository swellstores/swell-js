const { defaultMethods } = require('./utils');
const cache = require('./cache');

function methods(request) {
  const { get, list } = defaultMethods(request, '/attributes', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cache.getFetch('attributes', id, () => get(id, ...args));
    },

    list,
  };
}

module.exports = {
  methods,
};
