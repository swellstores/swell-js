import { cloneDeep } from './utils';
import { cleanProductOptions } from './products';

function methods(request, options) {
  return {
    state: null,
    order: null,
    settings: null,
    requested: false,
    pendingRequests: [],
    cacheClear: null,

    async requestStateChange(method, url, id, data) {
      return this.requestStateSync(async () => {
        const result = await request(method, url, id, data);
        if (result && result.errors) {
          return result;
        }
        this.state = result;
        return result;
      });
    },

    async requestStateSync(handler) {
      if (this.state) {
        return await handler();
      } else if (this.requested) {
        return new Promise((resolve) => {
          this.pendingRequests.push({ handler, resolve });
        });
      }

      this.requested = true;
      const result = await handler();
      this.requested = false;
      while (this.pendingRequests.length > 0) {
        const { handler, resolve } = this.pendingRequests.shift();
        resolve(handler());
      }
      return result;
    },

    get() {
      let data;
      if (this.cacheClear) {
        this.cacheClear = null;
        data = { $cache: false };
      }
      return this.requestStateChange('get', '/cart', undefined, data);
    },

    clearCache() {
      this.cacheClear = true;
    },

    getItemData(item, data = {}) {
      let result = cloneDeep(item);
      if (typeof item === 'string') {
        result = {
          ...(data || {}),
          product_id: item,
        };
      }
      if (result && result.options) {
        result.options = cleanProductOptions(result.options);
      }
      return result;
    },

    addItem(item, data) {
      return this.requestStateChange('post', '/cart/items', this.getItemData(item, data));
    },

    updateItem(id, item) {
      return this.requestStateChange('put', `/cart/items/${id}`, this.getItemData(item));
    },

    setItems(input) {
      let items = input;
      if (items && items.map) {
        items = items.map(this.getItemData);
      }
      return this.requestStateChange('put', '/cart/items', items);
    },

    removeItem(id) {
      return this.requestStateChange('delete', `/cart/items/${id}`);
    },

    recover(checkoutId) {
      return this.requestStateChange('put', `/cart/recover/${checkoutId}`);
    },

    update(input) {
      let data = input;
      if (data.items && data.items.map) {
        data = {
          ...data,
          items: data.items.map(this.getItemData),
        };
      }
      return this.requestStateChange('put', `/cart`, data);
    },

    applyCoupon(code) {
      return this.requestStateChange('put', '/cart/coupon', { code });
    },

    removeCoupon() {
      return this.requestStateChange('delete', '/cart/coupon');
    },

    applyGiftcard(code) {
      return this.requestStateChange('post', '/cart/giftcards', { code });
    },

    removeGiftcard(id) {
      return this.requestStateChange('delete', `/cart/giftcards/${id}`);
    },

    async getShippingRates() {
      await this.requestStateChange('get', '/cart/shipment-rating');
      return this.state[options.useCamelCase ? 'shipmentRating' : 'shipment_rating'];
    },

    async submitOrder() {
      const result = await request('post', '/cart/order');
      if (result.errors) {
        return result;
      }
      this.state = null;
      this.order = result;
      return result;
    },

    async getOrder(checkoutId = undefined) {
      let result;
      if (checkoutId) {
        result = await request('get', `/cart/order`, { checkout_id: checkoutId });
      } else {
        result = await request('get', `/cart/order`);
      }
      this.order = result;
      return result;
    },

    async getSettings() {
      this.settings = await request('get', '/cart/settings');
      return this.settings;
    },
  };
}

export default methods;
