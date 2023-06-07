import { c as cleanProductOptions } from './products-d194c3c6.js';
import { d as defaultMethods } from './index-ca9cb73c.js';
import { c as cacheApi } from './cache-b92f4460.js';

function methods(request) {
  const { get, list } = defaultMethods(request, '/subscriptions', [
    'list',
    'get',
  ]);
  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('subscriptions', id, () => get(id, ...args));
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
      return request('post', '/subscriptions', this.getCleanData(data));
    },

    update(id, data) {
      return request('put', `/subscriptions/${id}`, this.getCleanData(data));
    },

    addItem(id, item) {
      return request(
        'post',
        `/subscriptions/${id}/items`,
        this.getCleanData(item),
      );
    },

    setItems(id, items) {
      if (items && items.map) {
        items = items.map(this.getCleanData);
      }
      return request('put', `/subscriptions/${id}/items`, items);
    },

    updateItem(id, itemId, item) {
      return request(
        'put',
        `/subscriptions/${id}/items/${itemId}`,
        this.getCleanData(item),
      );
    },

    removeItem(id, itemId) {
      return request('delete', `/subscriptions/${id}/items/${itemId}`);
    },
  };
}

export { methods as m };
