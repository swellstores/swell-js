"use strict";

var cache = require('./cache');

function methods(request) {
  return {
    get: function get(type, id, query) {
      return cache.getSetOnce("content_".concat(type), id, function () {
        return request('get', "/content/".concat(type), id, query);
      });
    },
    list: function list(type, query) {
      return request('get', "/content/".concat(type), undefined, query);
    }
  };
}

module.exports = {
  methods: methods
};