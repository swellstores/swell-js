import Payment from '../payment';
import {
  getTotal,
  getLineItems,
  getShippingMethods,
  convertToSwellAddress,
  createError,
  getErrorMessage,
  onCouponCodeChanged,
  onShippingMethodSelected,
  onShippingContactSelected,
} from '../apple';
import { base64Encode } from '../../utils';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

const VERSION = 3;

const MERCHANT_CAPABILITIES = Object.freeze([
  'supports3DS',
  'supportsDebit',
  'supportsCredit',
]);

const ALLOWED_CARD_NETWORKS = Object.freeze([
  'amex',
  'discover',
  'interac',
  'jcb',
  'masterCard',
  'visa',
]);

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
      settings: { country },
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
      total: getTotal(cart),
      countryCode: country,
      currencyCode: currency,
      supportedNetworks: ALLOWED_CARD_NETWORKS,
      merchantCapabilities: MERCHANT_CAPABILITIES,
      requiredShippingContactFields,
      requiredBillingContactFields,
      supportsCouponCode: true,
      shippingMethods: getShippingMethods(cart),
      lineItems: getLineItems(cart),
    };
  }

  /** @param {ApplePayJS.ApplePayPaymentRequest} paymentRequest */
  _createPaymentSession(paymentRequest) {
    const session = new this.ApplePaySession(VERSION, paymentRequest);

    session.addEventListener(
      'validatemerchant',
      /** @param {ApplePayJS.ApplePayValidateMerchantEvent} event */
      async (event) => {
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
      },
    );

    session.addEventListener(
      'shippingcontactselected',
      onShippingContactSelected.bind(this, session),
    );

    session.addEventListener(
      'shippingmethodselected',
      onShippingMethodSelected.bind(this, session),
    );

    session.addEventListener(
      'couponcodechanged',
      onCouponCodeChanged.bind(this, session),
    );

    session.addEventListener(
      'paymentauthorized',
      /** @param {ApplePayJS.ApplePayPaymentAuthorizedEvent} event */
      async (event) => {
        const {
          payment: { token, shippingContact, billingContact },
        } = event;
        const { require: { shipping: requireShipping } = {} } = this.params;

        const cart = await this.updateCart({
          account: {
            email: shippingContact.emailAddress,
          },
          billing: {
            method: 'apple',
            account_card_id: null,
            card: null,
            apple: {
              token: base64Encode(JSON.stringify(token.paymentData)),
              gateway: 'authorizenet',
            },
            ...convertToSwellAddress(billingContact),
          },
          ...(requireShipping && {
            shipping: convertToSwellAddress(shippingContact),
          }),
        });

        if (cart.errors) {
          return session.completePayment({
            status: this.ApplePaySession.STATUS_FAILURE,
            errors: createError('unknown', getErrorMessage(cart.errors)),
          });
        }

        this.onSuccess();

        return session.completePayment({
          status: this.ApplePaySession.STATUS_SUCCESS,
        });
      },
    );

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
