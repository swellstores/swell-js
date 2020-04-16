function methods(request) {
  return {
    list: (type, query) => request('get', `/content/${type}`, undefined, query),
    get: (type, id, query) => request('get', `/content/${type}`, id, query),
  };
}

module.exports = {
  methods,
};
