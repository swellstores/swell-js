import Payment from '../payment';
import { get } from '../../utils';
import { LibraryNotLoadedError } from '../../utils/errors';

export default class PaypalDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id, merchant_id } = this.method;

    return [
      {
        id: 'paypal-sdk',
        params: {
          client_id,
          merchant_id,
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

  async createElements() {
    const cart = await this.getCart();
    const { locale, style, elementId } = this.params;

    if (!(cart.capture_total > 0)) {
      throw new Error(
        'Invalid PayPal button amount. Value should be greater than zero.',
      );
    }

    const button = this.paypal.Buttons({
      locale: locale || 'en_US',
      style: style || {
        layout: 'horizontal',
        height: 45,
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        tagline: false,
      },
      createOrder: this._onCreateOrder.bind(this, cart),
      onApprove: this._onApprove.bind(this, cart),
      onError: this.onError.bind(this),
    });

    button.render(elementId || '#paypal-button');
  }

  _onCreateOrder(cart, data, actions) {
    const { capture_total, currency } = cart;

    return actions.order.create({
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          amount: {
            value: +capture_total.toFixed(2),
            currency_code: currency,
          },
        },
      ],
    });
  }

  async _onApprove(cart, data, actions) {
    const order = await actions.order.get();
    const orderId = order.id;
    const payer = order.payer;
    const shipping = get(order, 'purchase_units[0].shipping');

    await this.updateCart({
      account: {
        email: payer.email_address,
      },
      billing: {
        method: 'paypal',
        paypal: {
          order_id: orderId,
        },
      },
      shipping: {
        name: shipping.name.full_name,
        address1: shipping.address.address_line_1,
        address2: shipping.address.address_line_2,
        state: shipping.address.admin_area_1,
        city: shipping.address.admin_area_2,
        zip: shipping.address.postal_code,
        country: shipping.address.country_code,
      },
    });

    this.onSuccess();
  }
}
