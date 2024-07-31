import { cleanProductOptions } from './products';
import { defaultMethods } from './utils';
import cache from './cache';

function methods(api) {
  const { get, list } = defaultMethods(api, '/subscriptions', ['list', 'get']);
  return {
    get: (id, ...args) => {
      return cache.getFetch('subscriptions', id, () => get(id, ...args));
    },

    list,

    getCleanData(data) {
      if (data && data.options) {
        data.options = cleanProductOptions(data.options);
      }
      if (data.items && data.items.map) {
        data.items = data.items.map((item) => {
          if (item.options) {
            item.options = cleanProductOptions(item.options);
          }
          return item;
        });
      }
      return data;
    },

    create(data) {
      return api.request('post', '/subscriptions', this.getCleanData(data));
    },

    update(id, data) {
      return api.request(
        'put',
        `/subscriptions/${id}`,
        this.getCleanData(data),
      );
    },

    addItem(id, item) {
      return api.request(
        'post',
        `/subscriptions/${id}/items`,
        this.getCleanData(item),
      );
    },

    setItems(id, items) {
      if (items && items.map) {
        items = items.map(this.getCleanData);
      }
      return api.request('put', `/subscriptions/${id}/items`, items);
    },

    updateItem(id, itemId, item) {
      return api.request(
        'put',
        `/subscriptions/${id}/items/${itemId}`,
        this.getCleanData(item),
      );
    },

    removeItem(id, itemId) {
      return api.request('delete', `/subscriptions/${id}/items/${itemId}`);
    },
  };
}

export default methods;
