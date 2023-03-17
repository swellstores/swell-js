import Payment from '../payment';
import { LibraryNotLoadedError } from '../../utils/errors';

export default class BraintreePaypalPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id, merchant_id } = this.method;

    return [
      { id: 'braintree-paypal-sdk', params: { client_id, merchant_id } },
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

  async createElements() {
    const cart = await this.getCart();
    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    const braintreeClient = await this.braintree.client.create({
      authorization,
    });
    const paypalCheckout = await this.braintreePaypalCheckout.create({
      client: braintreeClient,
    });
    const button = this.paypal.Buttons({
      style: this.params.style || {},
      createBillingAgreement: this._onCreateBillingAgreement.bind(
        this,
        paypalCheckout,
        cart,
      ),
      onApprove: this._onApprove.bind(this, paypalCheckout),
      onCancel: this.onCancel.bind(this),
      onError: this.onError.bind(this),
    });

    button.render(this.params.elementId || '#paypal-button');
  }

  _onCreateBillingAgreement(paypalCheckout, cart) {
    return paypalCheckout.createPayment({
      flow: 'vault',
      currency: cart.currency,
      amount: cart.capture_total,
    });
  }

  async _onApprove(paypalCheckout, data, actions) {
    const { nonce } = await paypalCheckout.tokenizePayment(data);

    await this.updateCart({
      billing: {
        method: 'paypal',
        paypal: {
          nonce,
        },
      },
    });

    this.onSuccess(data, actions);
  }
}
