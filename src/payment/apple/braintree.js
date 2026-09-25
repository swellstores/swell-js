import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

import {
  getLineItems,
  getRequiredContactFields,
  convertToSwellAddress,
  onShippingContactSelected,
  onShippingMethodSelected,
  onCouponCodeChanged,
} from '../apple';

import Payment from '../payment';

/** @typedef {import('../../../types').Cart} Cart */

const VERSION = 14;

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

  /** @param {Cart} cart */
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

    const paymentRequest = this._createPaymentRequest(cart, applePayment);

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
   * @param {braintree.ApplePay} applePayment
   * @param {ApplePayJS.ApplePayPaymentRequest} paymentRequest
   * @returns {HTMLDivElement}
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

  /** @returns {Promise<braintree.Client>} */
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

  /**
   * @param {Cart} cart
   * @param {braintree.ApplePay} applePayment
   * @returns {ApplePayJS.ApplePayPaymentRequest}
   */
  _createPaymentRequest(cart, applePayment) {
    const {
      settings: { name, country },
      capture_total,
      currency,
    } = cart;

    const { requiredBillingContactFields, requiredShippingContactFields } =
      getRequiredContactFields(this.params);

    return applePayment.createPaymentRequest({
      total: {
        label: name,
        type: 'pending',
        amount: (capture_total || 0).toFixed(2),
      },
      countryCode: country,
      currencyCode: currency,
      /**
       * @see {@link https://developer.paypal.com/braintree/docs/guides/apple-pay/client-side/javascript/v3/#create-anapplepaysession}
       *
       * Braintree automatically fills in `supportedNetworks` and `merchantCapabilities`.
       */
      requiredShippingContactFields,
      requiredBillingContactFields,
      supportsCouponCode: true,
      lineItems: getLineItems(cart),
    });
  }

  /**
   * @param {braintree.ApplePay} applePayment
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

    session.onshippingcontactselected = onShippingContactSelected.bind(
      this,
      session,
    );

    session.onshippingmethodselected = onShippingMethodSelected.bind(
      this,
      session,
    );

    session.oncouponcodechanged = onCouponCodeChanged.bind(this, session);

    session.onpaymentauthorized = async (event) => {
      const {
        payment: { token, shippingContact, billingContact },
      } = event;

      const payload = await applePayment
        .tokenize({ token })
        .catch(this.onError.bind(this));

      if (!payload) {
        return session.completePayment(this.ApplePaySession.STATUS_FAILURE);
      }

      const cart = await this.updateCart({
        account: {
          email: shippingContact?.emailAddress || billingContact?.emailAddress,
        },
        billing: {
          method: 'apple',
          account_card_id: null,
          card: null,
          apple: {
            nonce: payload.nonce,
            gateway: 'braintree',
          },
          ...convertToSwellAddress(billingContact),
        },
        ...(shippingContact && {
          shipping: convertToSwellAddress(shippingContact),
        }),
      });

      if (cart.subscription_delivery) {
        try {
          const card = await this.api.card.createToken({
            gateway: 'braintree',
            account_id: cart.account_id,
            nonce: payload.nonce,
          });

          delete card.nonce;

          await this.updateCart({
            billing: {
              method: 'card',
              card,
              apple: null,
            },
          });
        } catch (error) {
          console.warn('Failed to extract card data from apple token', error);
        }
      }

      this.onSuccess();

      return session.completePayment(this.ApplePaySession.STATUS_SUCCESS);
    };

    session.begin();
  }
}
