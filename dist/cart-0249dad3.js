import 'qs';
import 'lodash/set';
import 'lodash/get';
import 'lodash/uniq';
import 'lodash/find';
import 'lodash/round';
import 'lodash/findIndex';
import 'lodash/camelCase';
import 'lodash/snakeCase';
import cloneDeep from 'lodash/cloneDeep';
import 'lodash/isEqual';
import 'deepmerge';
import 'object-keys-normalizer';
import { c as cleanProductOptions } from './products-b9b703d9.js';

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
        const { handler: handler2, resolve } = this.pendingRequests.shift();
        resolve(handler2());
      }
      return result;
    },
    get() {
      let data;
      if (this.cacheClear) {
        this.cacheClear = null;
        data = { $cache: false };
      }
      return this.requestStateChange("get", "/cart", void 0, data);
    },
    clearCache() {
      this.cacheClear = true;
    },
    getItemData(item, data = {}) {
      let result = cloneDeep(item);
      if (typeof item === "string") {
        result = __spreadProps(__spreadValues({}, data || {}), {
          product_id: item
        });
      }
      if (result && result.options) {
        result.options = cleanProductOptions(result.options);
      }
      return result;
    },
    addItem(item, data) {
      return this.requestStateChange(
        "post",
        "/cart/items",
        this.getItemData(item, data)
      );
    },
    updateItem(id, item) {
      return this.requestStateChange(
        "put",
        `/cart/items/${id}`,
        this.getItemData(item)
      );
    },
    setItems(input) {
      let items = input;
      if (items && items.map) {
        items = items.map(this.getItemData);
      }
      return this.requestStateChange("put", "/cart/items", items);
    },
    removeItem(id) {
      return this.requestStateChange("delete", `/cart/items/${id}`);
    },
    recover(checkoutId) {
      return this.requestStateChange("put", `/cart/recover/${checkoutId}`);
    },
    update(input) {
      let data = input;
      if (data.items && data.items.map) {
        data = __spreadProps(__spreadValues({}, data), {
          items: data.items.map(this.getItemData)
        });
      }
      return this.requestStateChange("put", `/cart`, data);
    },
    applyCoupon(code) {
      return this.requestStateChange("put", "/cart/coupon", { code });
    },
    removeCoupon() {
      return this.requestStateChange("delete", "/cart/coupon");
    },
    applyGiftcard(code) {
      return this.requestStateChange("post", "/cart/giftcards", { code });
    },
    removeGiftcard(id) {
      return this.requestStateChange("delete", `/cart/giftcards/${id}`);
    },
    async getShippingRates() {
      await this.requestStateChange("get", "/cart/shipment-rating");
      return this.state[options.useCamelCase ? "shipmentRating" : "shipment_rating"];
    },
    async submitOrder() {
      const result = await request("post", "/cart/order");
      if (result.errors) {
        return result;
      }
      this.state = null;
      this.order = result;
      return result;
    },
    async getOrder(checkoutId = void 0) {
      let result;
      if (checkoutId) {
        result = await request("get", `/cart/order`, {
          checkout_id: checkoutId
        });
      } else {
        result = await request("get", `/cart/order`);
      }
      this.order = result;
      return result;
    },
    async getSettings() {
      this.settings = await request("get", "/cart/settings");
      return this.settings;
    }
  };
}

export { methods as m };
