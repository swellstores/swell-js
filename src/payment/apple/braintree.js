import Payment from '../payment';
import { convertToSwellAddress } from '../apple';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

const VERSION = 3;

const MERCHANT_CAPABILITIES = [
  'supports3DS',
  'supportsDebit',
  'supportsCredit',
];

export default class BraintreeApplePayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(api, options, params, methods.apple);
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

  /** @returns {typeof ApplePaySession} */
  get ApplePaySession() {
    if (!window.ApplePaySession) {
      throw new LibraryNotLoadedError('Apple');
    }

    return window.ApplePaySession;
  }

  async createElements(cart) {
    const { elementId = 'applepay-button' } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

    if (!this.ApplePaySession.canMakePayments()) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    const braintreeClient = await this._createBraintreeClient();
    const applePayment = await this.braintree.applePay.create({
      client: braintreeClient,
    });
    const paymentRequest = await this._createPaymentRequest(cart, applePayment);

    this.element = this._createButton(applePayment, paymentRequest);
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    container.appendChild(this.element);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  /**
   * @param {object} applePayment
   * @param {ApplePayJS.ApplePayPaymentRequest} paymentRequest
   */
  _createButton(applePayment, paymentRequest) {
    const { style: { type = 'plain', theme = 'black', height = '40px' } = {} } =
      this.params;

    const button = document.createElement('div');

    button.style.appearance = '-apple-pay-button';
    button.style['-apple-pay-button-type'] = type;
    button.style['-apple-pay-button-style'] = theme;
    button.style.height = height;

    button.addEventListener(
      'click',
      this._createPaymentSession.bind(this, applePayment, paymentRequest),
    );

    return button;
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

  /** @returns {ApplePayJS.ApplePayPaymentRequest} */
  _createPaymentRequest(cart, applePayment) {
    const { require = {} } = this.params;
    const {
      settings: { name, country },
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
      countryCode: country,
      currencyCode: currency,
      merchantCapabilities: MERCHANT_CAPABILITIES,
      requiredShippingContactFields,
      requiredBillingContactFields,
    });
  }

  /**
   * @param {object} applePayment
   * @param {ApplePayJS.ApplePayPaymentRequest} paymentRequest
   */
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
        },
        billing: {
          method: 'apple',
          apple: {
            nonce: payload.nonce,
            gateway: 'braintree',
          },
          ...convertToSwellAddress(billingContact),
        },
        ...(requireShipping && {
          shipping: convertToSwellAddress(shippingContact),
        }),
      });

      this.onSuccess();

      return session.completePayment(this.ApplePaySession.STATUS_SUCCESS);
    };

    session.begin();
  }
}
