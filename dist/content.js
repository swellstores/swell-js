"use strict";

function methods(request) {
  return {
    list: function list(type, query) {
      return request('get', "/content/".concat(type), undefined, query);
    },
    get: function get(type, id, query) {
      return request('get', "/content/".concat(type), id, query);
    }
  };
}

module.exports = {
  methods: methods
};