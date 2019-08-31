"use strict";

var _require = require('./products'),
    cleanProductOptions = _require.cleanProductOptions;

function methods(request) {
  return {
    get: function get(id, query) {
      return request('get', '/subscriptions', id, query);
    },
    getCleanData: function getCleanData(data) {
      if (data && data.options) {
        data.options = cleanProductOptions(data.options);
      }

      if (data.items && data.items.map) {
        data.items = data.items.map(function (item) {
          if (item.options) {
            item.options = cleanProductOptions(item.options);
          }

          return item;
        });
      }

      return data;
    },
    create: function create(data) {
      return request('post', '/subscriptions', this.getCleanData(data));
    },
    update: function update(id, data) {
      return request('put', "/subscriptions/".concat(id), this.getCleanData(data));
    },
    addItem: function addItem(id, item) {
      return request('post', "/subscriptions/".concat(id, "/items"), this.getCleanData(item));
    },
    setItems: function setItems(id, items) {
      if (items && items.map) {
        items = items.map(this.getCleanData);
      }

      return request('put', "/subscriptions/".concat(id, "/items"), items);
    },
    updateItem: function updateItem(id, itemId, item) {
      return request('put', "/subscriptions/".concat(id, "/items/").concat(itemId), this.getCleanData(item));
    },
    removeItem: function removeItem(id, itemId) {
      return request('delete', "/subscriptions/".concat(id, "/items/").concat(itemId));
    }
  };
}

module.exports = {
  methods: methods
};