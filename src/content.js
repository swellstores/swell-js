const cache = require('./cache');

function methods(request) {
  return {
    get: (type, id, query) => {
      return cache.getSetOnce(`content_${type}`, id, () =>
        request('get', `/content/${type}`, id, query),
      );
    },

    list: (type, query) => request('get', `/content/${type}`, undefined, query),
  };
}

module.exports = {
  methods,
};
