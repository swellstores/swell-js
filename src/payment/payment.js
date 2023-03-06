import cartApi from '../cart';
import settingsApi from '../settings';
import {
  get,
  pick,
  vaultRequest,
  isFunction,
  toSnake,
  cloneDeep,
} from '../utils';
import loadScripts from '../utils/script-loader';

export default class Payment {
  constructor(request, options, params, method) {
    this.request = request;
    this.options = options;
    this.params = params;
    this.method = method;
  }

  async loadScripts(scripts) {
    await this._populateScriptsParams(scripts);
    await loadScripts(scripts);
  }

  async getCart() {
    const cart = await cartApi(this.request, this.options).get();

    if (!cart) {
      throw new Error('Cart not found');
    }

    return toSnake(cart);
  }

  async updateCart(data) {
    const updateData = cloneDeep(data);

    // account data should only be updated when the user is a guest and no email is present
    if (data.account) {
      const cart = await this.getCart();
      const shouldUpdateAccount = cart.guest && !get(cart, 'account.email');

      if (!shouldUpdateAccount) {
        delete updateData.account;
      }
    }

    return cartApi(this.request, this.options).update(updateData);
  }

  async getSettings() {
    return settingsApi(this.request, this.options).get();
  }

  async createIntent(data) {
    return this._vaultRequest('post', '/intent', data);
  }

  async updateIntent(data) {
    return this._vaultRequest('put', '/intent', data);
  }

  async authorizeGateway(data) {
    return this._vaultRequest('post', '/authorization', data);
  }

  onSuccess(data) {
    const successHandler = get(this.params, 'onSuccess');

    if (isFunction(successHandler)) {
      return successHandler(data);
    }
  }

  onCancel() {
    const cancelHandler = get(this.params, 'onCancel');

    if (isFunction(cancelHandler)) {
      return cancelHandler();
    }
  }

  onError(error) {
    const errorHandler = get(this.params, 'onError');

    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }

    console.error(error.message);
  }

  async _vaultRequest(method, url, data) {
    const response = await vaultRequest(method, url, data);

    if (response.errors) {
      const param = Object.keys(response.errors)[0];
      const err = new Error(response.errors[param].message || 'Unknown error');
      err.code = 'vault_error';
      err.status = 402;
      err.param = param;
      throw err;
    }

    return response;
  }

  async _populateScriptsParams(scripts = []) {
    for (const script of scripts) {
      await this._populateScriptWithCartParams(script);
    }
  }

  async _populateScriptWithCartParams(script) {
    const cartParams = get(script, 'params.cart');

    if (!cartParams) {
      return;
    }

    const cart = await this.getCart();

    script.params = {
      ...script.params,
      ...pick(cart, cartParams),
    };

    delete script.params.cart;
  }
}
