const { cleanProductOptions } = require('./products');

function methods(request, options) {
  return {
    state: null,
    order: null,
    settings: null,

    async requestStateChange(method, url, id, data) {
      const result = await request(method, url, id, data);
      if (result && result.errors) {
        return result;
      }
      this.state = result;
      return result;
    },

    get() {
      return this.requestStateChange('get', '/cart');
    },

    getItemData(item, data = {}) {
      let result = item;
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

    setItems(items) {
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

    update(data) {
      if (data.items && data.items.map) {
        data.items = data.items.map(this.getItemData);
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

module.exports = {
  methods,
};
