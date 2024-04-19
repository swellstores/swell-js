import Payment from '../payment';
import { LibraryNotLoadedError } from '../../utils/errors';

export default class BraintreePaypalPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id, merchant_id } = this.method;

    return [
      {
        id: 'braintree-paypal-sdk',
        params: { client_id, merchant_id, cart: ['currency'] },
      },
      'braintree-web',
      'braintree-web-paypal-checkout',
    ];
  }

  get paypal() {
    if (!window.paypal) {
      throw new LibraryNotLoadedError('PayPal');
    }

    return window.paypal;
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get braintreePaypalCheckout() {
    if (!this.braintree.paypalCheckout) {
      throw new LibraryNotLoadedError('Braintree PayPal Checkout');
    }

    return this.braintree.paypalCheckout;
  }

  async createElements(cart) {
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
    } = this.params;

    this.setElementContainer(elementId);

    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    await this.loadScripts(this.scripts);

    const braintreeClient = await this.braintree.client.create({
      authorization,
    });
    const paypalCheckout = await this.braintreePaypalCheckout.create({
      client: braintreeClient,
    });

    this.element = this.paypal.Buttons({
      locale,
      style: {
        layout,
        height,
        color,
        shape,
        label,
        tagline,
      },
      fundingSource: this.paypal.FUNDING.PAYPAL,
      createBillingAgreement: this._createBillingAgreement.bind(
        this,
        paypalCheckout,
        cart,
      ),
      onApprove: this._onApprove.bind(this, paypalCheckout),
      onCancel: this.onCancel.bind(this),
      onError: this.onError.bind(this),
    });
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    this.element.render(`#${container.id}`);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  _createBillingAgreement(paypalCheckout, cart) {
    const { require: { shipping: requireShipping = true } = {} } = this.params;

    return paypalCheckout.createPayment({
      flow: 'vault',
      amount: cart.capture_total,
      currency: cart.currency,
      requestBillingAgreement: true,
      enableShippingAddress: Boolean(requireShipping),
    });
  }

  async _onApprove(paypalCheckout, data, _actions) {
    const { require: { shipping: requireShipping = true } = {} } = this.params;
    const { details, nonce } = await paypalCheckout.tokenizePayment(data);
    const { email, countryCode, firstName, lastName } = details;

    await this.updateCart({
      account: {
        email: email,
      },
      billing: {
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        country: countryCode,
        method: 'paypal',
        paypal: {
          nonce,
        },
      },
      ...(requireShipping && {
        shipping: {
          name: details.shippingAddress.recipientName,
          ...this._mapAddress(details.shippingAddress),
        },
      }),
    });

    this.onSuccess();
  }

  _mapAddress(address) {
    return {
      address1: address.line1,
      address2: address.line2,
      state: address.state,
      city: address.city,
      zip: address.postalCode,
      country: address.countryCode,
    };
  }
}
