import Payment from '../payment';
import { get, isEmpty } from '../../utils';
import {
  LibraryNotLoadedError,
  DomElementNotFoundError,
} from '../../utils/errors';

export default class PaypalDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id } = this.method;

    return [
      {
        id: 'paypal-sdk',
        params: {
          client_id,
          merchant_id: this.merchantId,
          cart: ['currency'],
        },
      },
    ];
  }

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

  async createElements() {
    const cart = await this.getCart();
    const hasSubscriptionProduct = Boolean(cart.subscription_delivery);

    if (hasSubscriptionProduct && !this.method.ppcp) {
      throw new Error(
        'Subscriptions are only supported by PayPal Commerce Platform. See Payment settings in the Swell dashboard to enable PayPal Commerce Platform',
      );
    }

    if (!(cart.capture_total > 0)) {
      throw new Error(
        'Invalid PayPal button amount. Value should be greater than zero.',
      );
    }

    const {
      elementId = 'paypal-button',
      locale = 'en_US',
      style: {
        layout = 'horizontal',
        height = 45,
        color = 'gold',
        shape = 'rect',
        label = 'paypal',
        tagline = false,
      } = {},
      classes = {},
    } = this.params;
    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    const button = this.paypal.Buttons({
      locale,
      style: {
        layout,
        height,
        color,
        shape,
        label,
        tagline,
      },
      createOrder: this._onCreateOrder.bind(this, cart),
      onShippingChange: this._onShippingChange.bind(this),
      onApprove: this._onApprove.bind(this),
      onError: this.onError.bind(this),
    });

    button.render(`#${elementId}`);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  async _onCreateOrder(cart, data, actions) {
    const { require: { shipping: requireShipping = true } = {} } = this.params;
    const { capture_total, currency, subscription_delivery } = cart;
    const hasSubscriptionProduct = Boolean(subscription_delivery);
    const merchantId = this.merchantId;
    const returnUrl = this.returnUrl;
    const orderData = {
      application_context: {
        shipping_preference: requireShipping ? 'GET_FROM_FILE' : 'NO_SHIPPING',
      },
    };
    const purchaseUnit = {
      amount: {
        value: Number(capture_total.toFixed(2)),
        currency_code: currency,
      },
    };

    if (merchantId) {
      // express checkout and ppcp
      orderData.intent = 'AUTHORIZE';
      purchaseUnit.payee = {
        merchant_id: merchantId,
      };

      if (hasSubscriptionProduct) {
        orderData.payment_source = {
          paypal: {
            attributes: {
              vault: {
                store_in_vault: 'ON_SUCCESS',
                usage_type: 'MERCHANT',
              },
            },
            experience_context: {
              return_url: `${returnUrl}&redirect_status=succeeded`,
              cancel_url: `${returnUrl}&redirect_status=canceled`,
            },
          },
        };
      }
    } else {
      // progressive checkout
      orderData.intent = 'CAPTURE';
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

  async _onShippingChange(data, actions) {
    try {
      const { orderID, shipping_address, selected_shipping_option } = data;
      const updateData = {
        shipping: {
          state: shipping_address.state,
          city: shipping_address.city,
          zip: shipping_address.postal_code,
          country: shipping_address.country_code,
        },
        shipment_rating: null,
      };

      if (selected_shipping_option) {
        updateData.shipping.service = selected_shipping_option.id;
        updateData.$taxes = true;
      }

      const cart = await this.updateCart(updateData);
      const shippingServices = get(cart, 'shipment_rating.services');

      // can't fulfill shipping to selected address
      if (isEmpty(shippingServices)) {
        return actions.reject();
      }

      let selectedShippingService;

      if (selected_shipping_option) {
        selectedShippingService = shippingServices.find(
          (shippingService) =>
            shippingService.id === selected_shipping_option.id,
        );
      }

      // need to set first service for cart by default
      if (!selectedShippingService) {
        const [firstShippingService] = shippingServices;

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

      return orderID;
    } catch (error) {
      this.onError(error);

      return actions.reject();
    }
  }

  async _onApprove(data, actions) {
    const { require: { shipping: requireShipping = true } = {} } = this.params;
    const order = await actions.order.get();
    const orderId = order.id;
    const payer = order.payer;
    const billing = payer.address;
    const shipping = get(order, 'purchase_units[0].shipping');
    const name = `${payer.name.given_name} ${payer.name.surname}`;

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
        ...this._mapAddress(billing),
      },
      ...(requireShipping && {
        shipping: {
          first_name: payer.name.given_name,
          last_name: payer.name.surname,
          name: shipping.name.full_name,
          ...this._mapAddress(shipping.address),
        },
      }),
    });

    this.onSuccess();
  }

  _mapAddress(address) {
    return {
      address1: address.address_line_1,
      address2: address.address_line_2,
      state: address.admin_area_1,
      city: address.admin_area_2,
      zip: address.postal_code,
      country: address.country_code,
    };
  }
}
