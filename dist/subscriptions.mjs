import { cleanProductOptions } from './products.mjs';
import { d as defaultMethods } from './index.738bc14a.mjs';
import cacheApi from './cache.mjs';
import './attributes.mjs';
import './find.18f1ac6d.mjs';
import 'qs';
import './round.577a8441.mjs';
import 'deepmerge';
import 'fast-case';

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

export { methods as default };
