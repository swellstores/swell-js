import { isEmpty } from '../../utils';
import { LibraryNotLoadedError } from '../../utils/errors';

import Payment from '../payment';

/** @typedef {import('@paypal/paypal-js').PayPalNamespace} PayPal */
/** @typedef {import('@paypal/paypal-js').ShippingAddress} ShippingAddress */
/** @typedef {import('@paypal/paypal-js').CreateOrderData} CreateOrderData */
/** @typedef {import('@paypal/paypal-js').CreateOrderActions} CreateOrderActions */
/** @typedef {import('@paypal/paypal-js').OnShippingAddressChangeData} OnShippingAddressChangeData */
/** @typedef {import('@paypal/paypal-js').OnShippingAddressChangeActions} OnShippingAddressChangeActions */
/** @typedef {import('@paypal/paypal-js').OnShippingOptionsChangeData} OnShippingOptionsChangeData */
/** @typedef {import('@paypal/paypal-js').OnShippingOptionsChangeActions} OnShippingOptionsChangeActions */
/** @typedef {import('@paypal/paypal-js').OnApproveData} OnApproveData */
/** @typedef {import('@paypal/paypal-js').OnApproveActions} OnApproveActions */
/** @typedef {import('../../../types').Cart} Cart */
/** @typedef {import('../../../types').Address} Address */

export default class PaypalDirectPayment extends Payment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods.paypal);
  }

  /** @param {Cart} cart */
  getScripts(cart) {
    const { client_id } = this.method;

    return [
      {
        id: 'paypal-sdk',
        params: {
          client_id,
          merchant_id: this.merchantId,
          cart: ['currency'],
          vault: cart.subscription_delivery,
        },
      },
    ];
  }

  /** @returns {PayPal} */
  get paypal() {
    if (!window.paypal) {
      throw new LibraryNotLoadedError('PayPal');
    }

    return window.paypal;
  }

  get merchantId() {
    const { mode, ppcp } = this.method;

    return ppcp ? this.method[`${mode}_merchant_id`] : this.method.merchant_id;
  }

  get returnUrl() {
    return `${
      window.location.origin + window.location.pathname
    }?gateway=paypal`;
  }

  async createElements(cart) {
    const {
      elementId = 'paypal-button',
      style: {
        layout = 'horizontal',
        height = 45,
        color = 'gold',
        shape = 'rect',
        label = 'paypal',
        tagline = false,
      } = {},
      require: { shipping: requireShipping = true } = {},
    } = this.params;

    this.setElementContainer(elementId);

    this._validateCart(cart);
    await this.loadScripts(this.getScripts(cart));

    /** @type {import('@paypal/paypal-js').PayPalButtonsComponentOptions} */
    const buttonsOptions = {
      style: {
        layout,
        height,
        color,
        shape,
        label,
        tagline,
      },
      fundingSource: this.paypal.FUNDING.PAYPAL,
      createOrder: this._onCreateOrder.bind(this, cart),
      onApprove: this._onApprove.bind(this),
      onError: this.onError.bind(this),
    };

    if (requireShipping) {
      buttonsOptions.onShippingAddressChange =
        this._onShippingAddressChange.bind(this);

      buttonsOptions.onShippingOptionsChange =
        this._onShippingOptionsChange.bind(this);
    }

    const component = this.paypal.Buttons(buttonsOptions);

    if (!component.isEligible()) {
      throw new Error('PayPal button with provided options is not eligible.');
    }

    this.element = component;
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    this.element.render(`#${container.id}`);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  /** @param {Cart} cart */
  _validateCart(cart) {
    const hasSubscriptionProduct = Boolean(cart.subscription_delivery);

    if (hasSubscriptionProduct && !this.method.ppcp) {
      throw new Error(
        'Subscriptions are only supported by PayPal Commerce Platform. See Payment settings in the Swell dashboard to enable PayPal Commerce Platform',
      );
    }

    if ((cart.capture_total || 0) <= 0) {
      throw new Error(
        'Invalid PayPal button amount. Value should be greater than zero.',
      );
    }
  }

  /**
   * @param {Cart} cart
   * @param {CreateOrderData} _data
   * @param {CreateOrderActions} _actions
   * @returns {Promise<string>}
   */
  async _onCreateOrder(cart, _data, _actions) {
    const {
      locale = 'en-US',
      require: { shipping: requireShipping = true } = {},
    } = this.params;

    const { capture_total, currency, subscription_delivery } = cart;
    const hasSubscriptionProduct = Boolean(subscription_delivery);
    const merchantId = this.merchantId;
    const returnUrl = this.returnUrl;
    /** @type {import('@paypal/paypal-js').CreateOrderRequestBody} */
    const orderData = {};
    /** @type {import('@paypal/paypal-js').PurchaseUnit} */
    const purchaseUnit = {
      amount: {
        value: Number(capture_total).toFixed(2),
        currency_code: currency,
      },
    };

    if (merchantId) {
      // express checkout and ppcp
      orderData.intent = 'AUTHORIZE';

      orderData.payment_source = {
        paypal: {
          experience_context: {
            locale,
            shipping_preference: requireShipping
              ? 'GET_FROM_FILE'
              : 'NO_SHIPPING',
          },
        },
      };

      purchaseUnit.payee = {
        merchant_id: merchantId,
      };

      if (hasSubscriptionProduct) {
        orderData.payment_source.paypal.attributes = {
          vault: {
            store_in_vault: 'ON_SUCCESS',
            usage_type: 'MERCHANT',
          },
        };

        Object.assign(orderData.payment_source.paypal.experience_context, {
          return_url: `${returnUrl}&redirect_status=succeeded`,
          cancel_url: `${returnUrl}&redirect_status=canceled`,
        });
      }
    } else {
      // progressive checkout
      orderData.intent = 'CAPTURE';

      orderData.application_context = {
        locale,
        shipping_preference: requireShipping ? 'GET_FROM_FILE' : 'NO_SHIPPING',
      };

      purchaseUnit.payee = {
        email_address: this.method.store_owner_email,
      };
    }

    orderData.purchase_units = [purchaseUnit];

    const order = await this.createIntent({
      gateway: 'paypal',
      intent: orderData,
    });

    return order.id;
  }

  /**
   * @param {OnShippingAddressChangeData} data
   * @param {OnShippingAddressChangeActions} actions
   */
  async _onShippingAddressChange(data, actions) {
    try {
      const { orderID, shippingAddress } = data;

      const cart = await this.updateCart({
        shipping: {
          state: shippingAddress.state,
          city: shippingAddress.city,
          zip: shippingAddress.postalCode,
          country: shippingAddress.countryCode,
        },
        shipment_rating: null,
      });

      const shippingServices = cart.shipment_rating?.services;

      // Can't fulfill shipping to selected address
      if (isEmpty(shippingServices)) {
        return actions.reject();
      }

      let selectedShippingService = cart.shipping?.service;

      // need to set first service for cart by default
      if (!selectedShippingService) {
        const [firstShippingService] = shippingServices;
        selectedShippingService = firstShippingService.id;

        await this.updateCart({
          shipping: {
            service: firstShippingService.id,
          },
          $taxes: true,
        });
      }

      await this.updateIntent({
        gateway: 'paypal',
        intent: {
          cart_id: cart.id,
          paypal_order_id: orderID,
        },
      });
    } catch (error) {
      this.onError(error);

      return actions.reject();
    }
  }

  /**
   * @param {OnShippingOptionsChangeData} data
   * @param {OnShippingOptionsChangeActions} actions
   */
  async _onShippingOptionsChange(data, actions) {
    try {
      const { orderID, selectedShippingOption } = data;

      const cart = await this.updateCart({
        shipping: { service: selectedShippingOption.id },
        $taxes: true,
      });

      await this.updateIntent({
        gateway: 'paypal',
        intent: {
          cart_id: cart.id,
          paypal_order_id: orderID,
        },
      });
    } catch (error) {
      this.onError(error);

      return actions.reject();
    }
  }

  /**
   * @param {OnApproveData} data
   * @param {OnApproveActions} actions
   */
  async _onApprove(data, actions) {
    const order = await actions.order.get();
    const orderId = order.id;
    const payer = order.payment_source?.paypal || order.payer;
    const billing = payer.address;
    const shipping = order.purchase_units?.[0]?.shipping;
    const name = `${payer.name?.given_name} ${payer.name?.surname}`;

    await this.updateCart({
      account: {
        email: payer.email_address,
      },
      billing: {
        method: 'paypal',
        paypal: {
          order_id: orderId,
        },
        name,
        ...convertToSwellAddress(billing),
      },
      ...(shipping?.address && {
        shipping: {
          first_name: payer.name.given_name,
          last_name: payer.name.surname,
          name: shipping.name.full_name,
          ...convertToSwellAddress(shipping.address),
        },
      }),
    });

    this.onSuccess();
  }
}

/**
 * @param {ShippingAddress} address
 * @returns {Address}
 */
function convertToSwellAddress(address) {
  return {
    address1: address.address_line_1,
    address2: address.address_line_2,
    state: address.admin_area_1,
    city: address.admin_area_2,
    zip: address.postal_code,
    country: address.country_code,
  };
}
