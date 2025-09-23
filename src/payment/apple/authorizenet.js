import Payment from '../payment';
import { base64Encode } from '../../utils';
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

const ALLOWED_CARD_NETWORKS = [
  'amex',
  'discover',
  'interac',
  'jcb',
  'masterCard',
  'visa',
];

export default class AuthorizeNetApplePayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(api, options, params, methods.apple);
  }

  get scripts() {
    return ['apple-pay'];
  }

  /** @returns {typeof ApplePaySession} */
  get ApplePaySession() {
    if (!window.ApplePaySession) {
      throw new LibraryNotLoadedError('Apple');
    }

    return window.ApplePaySession;
  }

  /** @returns {ApplePayJS.ApplePayPaymentRequest} */
  _createPaymentRequest(cart) {
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

    return {
      total: {
        label: name,
        type: 'pending',
        amount: capture_total.toString(),
      },
      countryCode: country,
      currencyCode: currency,
      supportedNetworks: ALLOWED_CARD_NETWORKS,
      merchantCapabilities: MERCHANT_CAPABILITIES,
      requiredShippingContactFields,
      requiredBillingContactFields,
    };
  }

  /** @param {ApplePayJS.ApplePayPaymentContact} [address] */
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

  /** @param {ApplePayJS.ApplePayPaymentRequest} paymentRequest */
  _createPaymentSession(paymentRequest) {
    const session = new this.ApplePaySession(VERSION, paymentRequest);

    session.onvalidatemerchant = async (event) => {
      const merchantSession = await this.authorizeGateway({
        gateway: 'authorizenet',
        params: {
          method: 'apple',
          merchantIdentifier: this.method.merchant_id,
          validationURL: event.validationURL,
          displayName: paymentRequest.total.label,
          domainName: window.location.hostname,
        },
      });

      if (merchantSession.error) {
        throw new Error(merchantSession.error.message);
      }

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

      await this.updateCart({
        account: {
          email: shippingContact.emailAddress,
        },
        billing: {
          method: 'apple',
          apple: {
            token: base64Encode(JSON.stringify(token.paymentData)),
            gateway: 'authorizenet',
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

  /** @param {ApplePayJS.ApplePayPaymentRequest} paymentRequest */
  _createButton(paymentRequest) {
    const { style: { type = 'plain', theme = 'black', height = '40px' } = {} } =
      this.params;

    const button = document.createElement('apple-pay-button');

    button.setAttribute('buttonstyle', theme);
    button.setAttribute('type', type);
    button.style.setProperty('--apple-pay-button-width', '100%');
    button.style.setProperty('--apple-pay-button-height', height);

    button.addEventListener(
      'click',
      this._createPaymentSession.bind(this, paymentRequest),
    );

    return button;
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

    const paymentRequest = this._createPaymentRequest(cart);

    this.element = this._createButton(paymentRequest);
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    container.appendChild(this.element);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }
}
