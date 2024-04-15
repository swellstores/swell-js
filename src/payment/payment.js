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
import {
  DomElementNotFoundError,
  PaymentElementNotCreatedError,
} from '../utils/errors';

export default class Payment {
  _element = null;
  _elementContainer = null;

  constructor(request, options, params, method) {
    this.request = request;
    this.options = options;
    this.params = params;
    this.method = method;
  }

  /**
   * Returns a payment element.
   *
   * @returns {any}
   */
  get element() {
    if (!this._element) {
      throw new PaymentElementNotCreatedError(this.method.name);
    }

    return this._element;
  }

  /**
   * Sets a payment element.
   *
   * @param {any} element
   */
  set element(element) {
    this._element = element;
  }

  /**
   * Returns a HTMLElement container of the payment element.
   *
   * @returns {HTMLElement}
   */
  get elementContainer() {
    return this._elementContainer;
  }

  /**
   * Sets a HTMLElement container of the payment element.
   *
   * @param {string} elementId
   */
  setElementContainer(elementId) {
    this._elementContainer = document.getElementById(elementId);

    if (!this.elementContainer) {
      throw new DomElementNotFoundError(elementId);
    }
  }

  /**
   * Loads payment scripts.
   *
   * @param {Array<string | object>} scripts
   */
  async loadScripts(scripts) {
    await this._populateScriptsParams(scripts);
    await loadScripts(scripts);
  }

  /**
   * Returns a cart.
   *
   * @returns {Promise<object>}
   */
  async getCart() {
    const cart = await cartApi(this.request, this.options).get();

    if (!cart) {
      throw new Error('Cart not found');
    }

    return this._adjustCart(cart);
  }

  /**
   * Updates a cart.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
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

    const updatedCart = await cartApi(this.request, this.options).update(
      updateData,
    );

    return this._adjustCart(updatedCart);
  }

  /**
   * Returns the store settings.
   *
   * @returns {Promise<object>}
   */
  async getSettings() {
    return settingsApi(this.request, this.options).get();
  }

  /**
   * Creates a payment intent.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
  async createIntent(data) {
    return this._vaultRequest('post', '/intent', data);
  }

  /**
   * Updates a payment intent.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
  async updateIntent(data) {
    return this._vaultRequest('put', '/intent', data);
  }

  /**
   * Authorizes a payment gateway.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
  async authorizeGateway(data) {
    return this._vaultRequest('post', '/authorization', data);
  }

  /**
   * Reset the payment timer to update the payment status faster
   *
   * @param {string} id
   * @returns {Promise<object>}
   */
  resetAsyncPayment(id) {
    return this.request('put', '/payments', id, { $reset_async_payment: true });
  }

  /**
   * Calls the onSuccess handler.
   *
   * @param {object | undefined} data
   * @returns {any}
   */
  onSuccess(data) {
    const successHandler = get(this.params, 'onSuccess');

    if (isFunction(successHandler)) {
      return successHandler(data);
    }
  }

  /**
   * Calls the onCancel handler.
   *
   * @returns {any}
   */
  onCancel() {
    const cancelHandler = get(this.params, 'onCancel');

    if (isFunction(cancelHandler)) {
      return cancelHandler();
    }
  }

  /**
   * Calls the onError handler.
   *
   * @param {Error} error
   * @returns {any}
   */
  onError(error) {
    const errorHandler = get(this.params, 'onError');

    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }

    console.error(error.message);
  }

  /**
   * Adjusts cart data.
   *
   * @param {object} cart
   * @returns {Promise<object>}
   */
  async _adjustCart(cart) {
    return this._ensureCartSettings(cart).then(toSnake);
  }

  /**
   * Sets the store settings to cart.
   *
   * @param {object} cart
   * @returns {Promise<object>}
   */
  async _ensureCartSettings(cart) {
    if (cart.settings) {
      return cart;
    }

    const settings = await this.getSettings();

    return { ...cart, settings: { ...settings.store } };
  }

  /**
   * Sends a Vault request.
   *
   * @param {string} method
   * @param {string} url
   * @param {object} data
   * @returns {Promise<object>}
   */
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

  /**
   * Sets values for payment scripts.
   *
   * @param {Array<string | object>} scripts
   */
  async _populateScriptsParams(scripts = []) {
    for (const script of scripts) {
      await this._populateScriptWithCartParams(script);
    }
  }

  /**
   * Sets the cart values to the payment script params.
   *
   * @param {string | object} script
   */
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
