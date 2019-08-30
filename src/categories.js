const { defaultMethods } = require('./utils');

function methods(request) {
  return {
    ...defaultMethods(request, '/categories', ['list', 'get']),
  };
}

module.exports = {
  methods,
};
