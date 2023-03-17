import Payment from '../payment';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
  DomElementNotFoundError,
} from '../../utils/errors';

const VERSION = 3;
const MERCHANT_CAPABILITIES = [
  'supports3DS',
  'supportsDebit',
  'supportsCredit',
];

export default class BraintreeApplePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(request, options, params, methods.apple);
  }

  get scripts() {
    return ['braintree-web', 'braintree-apple-payment'];
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get ApplePaySession() {
    if (!window.ApplePaySession) {
      throw new LibraryNotLoadedError('Apple');
    }

    return window.ApplePaySession;
  }

  async createElements() {
    if (!this.ApplePaySession.canMakePayments()) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    const cart = await this.getCart();
    const braintreeClient = await this._createBraintreeClient();
    const applePayment = await this.braintree.applePay.create({
      client: braintreeClient,
    });
    const paymentRequest = await this._createPaymentRequest(cart, applePayment);

    this._renderButton(applePayment, paymentRequest);
  }

  _renderButton(applePayment, paymentRequest) {
    const {
      elementId = 'applepay-button',
      style: { type = 'plain', theme = 'black', height = '40px' } = {},
      classes = {},
    } = this.params;
    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    if (classes.base) {
      container.classList.add(classes.base);
    }

    const button = document.createElement('div');

    button.style.appearance = '-apple-pay-button';
    button.style['-apple-pay-button-type'] = type;
    button.style['-apple-pay-button-style'] = theme;
    button.style.height = height;

    button.addEventListener(
      'click',
      this._createPaymentSession.bind(this, applePayment, paymentRequest),
    );

    container.appendChild(button);
  }

  async _createBraintreeClient() {
    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    return this.braintree.client.create({
      authorization,
    });
  }

  _createPaymentRequest(cart, applePayment) {
    const { require = {} } = this.params;
    const {
      settings: { name },
      capture_total,
      currency,
    } = cart;

    const requiredShippingContactFields = [];
    const requiredBillingContactFields = ['postalAddress'];

    if (require.name) {
      requiredShippingContactFields.push('name');
    }
    if (require.email) {
      requiredShippingContactFields.push('email');
    }
    if (require.phone) {
      requiredShippingContactFields.push('phone');
    }
    if (require.shipping) {
      requiredShippingContactFields.push('postalAddress');
    }

    return applePayment.createPaymentRequest({
      total: {
        label: name,
        type: 'pending',
        amount: capture_total.toString(),
      },
      currencyCode: currency,
      merchantCapabilities: MERCHANT_CAPABILITIES,
      requiredShippingContactFields,
      requiredBillingContactFields,
    });
  }

  _createPaymentSession(applePayment, paymentRequest) {
    const session = new this.ApplePaySession(VERSION, paymentRequest);

    session.onvalidatemerchant = async (event) => {
      const merchantSession = await applePayment
        .performValidation({
          validationURL: event.validationURL,
          displayName: paymentRequest.total.label,
        })
        .catch(this.onError.bind(this));

      if (merchantSession) {
        session.completeMerchantValidation(merchantSession);
      } else {
        session.abort();
      }
    };

    session.onpaymentauthorized = async (event) => {
      const {
        payment: { token, shippingContact, billingContact },
      } = event;
      const { require: { shipping: requireShipping } = {} } = this.params;
      const payload = await applePayment
        .tokenize({ token })
        .catch(this.onError.bind(this));

      if (!payload) {
        return session.completePayment(this.ApplePaySession.STATUS_FAILURE);
      }

      await this.updateCart({
        account: {
          email: shippingContact.emailAddress,
          first_name: shippingContact.givenName,
          last_name: shippingContact.familyName,
        },
        billing: {
          method: 'apple',
          apple: {
            nonce: payload.nonce,
            gateway: 'braintree',
          },
          ...this._mapAddress(billingContact),
        },
        ...(requireShipping && {
          shipping: this._mapAddress(shippingContact),
        }),
      });

      this.onSuccess();

      return session.completePayment(this.ApplePaySession.STATUS_SUCCESS);
    };

    session.begin();
  }

  _mapAddress(address = {}) {
    return {
      first_name: address.givenName,
      last_name: address.familyName,
      address1: address.addressLines[0],
      address2: address.addressLines[1],
      city: address.locality,
      state: address.administrativeArea,
      zip: address.postalCode,
      country: address.countryCode,
      phone: address.phoneNumber,
    };
  }
}
