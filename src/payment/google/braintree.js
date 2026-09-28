import { isLiveMode } from '../../utils';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

import {
  onPaymentDataChanged,
  convertToSwellAddress,
  getShippingOptionParameters,
  getTransactionInfo,
  getOfferInfo,
} from '../google';

import Payment from '../payment';

/** @typedef {import('../../../types').Cart} Cart */

const API_VERSION = 2;
const API_MINOR_VERSION = 0;

export default class BraintreeGooglePayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(api, options, params, methods.google);
  }

  get scripts() {
    return ['google-pay', 'braintree-web', 'braintree-google-payment'];
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get google() {
    if (!window.google) {
      throw new LibraryNotLoadedError('Google');
    }

    return window.google;
  }

  /** @returns {google.payments.api.PaymentsClient} */
  get googleClient() {
    if (!BraintreeGooglePayment.googleClient) {
      if (this.google) {
        this.googleClient = new this.google.payments.api.PaymentsClient({
          environment: isLiveMode(this.method.mode) ? 'PRODUCTION' : 'TEST',
          paymentDataCallbacks: {
            onPaymentDataChanged: onPaymentDataChanged.bind(this),
          },
        });
      }

      if (!BraintreeGooglePayment.googleClient) {
        throw new LibraryNotLoadedError('Google client');
      }
    }

    return BraintreeGooglePayment.googleClient;
  }

  set googleClient(googleClient) {
    BraintreeGooglePayment.googleClient = googleClient;
  }

  /** @param {Cart} cart */
  async createElements(cart) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      require: { phone } = {},
      style: { color = 'black', type = 'plain', sizeMode = 'fill' } = {},
    } = this.params;

    if (!this.method.merchant_id) {
      throw new Error('Google merchant ID is not defined');
    }

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

    const braintreeClient = await this._createBraintreeClient();

    const googlePayment = await this.braintree.googlePayment.create({
      client: braintreeClient,
      googleMerchantId: this.method.merchant_id,
      googlePayVersion: API_VERSION,
    });

    const paymentDataRequest = googlePayment.createPaymentDataRequest(
      this._createPaymentRequestData(cart),
    );

    const cardPaymentMethod = paymentDataRequest.allowedPaymentMethods.find(
      (method) => method.type === 'CARD',
    );

    if (cardPaymentMethod !== undefined) {
      cardPaymentMethod.parameters.billingAddressRequired = true;

      cardPaymentMethod.parameters.billingAddressParameters = {
        format: 'FULL',
        phoneNumberRequired: Boolean(phone),
      };
    }

    const isReadyToPay = await this.googleClient.isReadyToPay({
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      allowedPaymentMethods: paymentDataRequest.allowedPaymentMethods,
      existingPaymentMethodRequired: true,
    });

    if (!isReadyToPay.result) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    this.element = this.googleClient.createButton({
      buttonColor: color,
      buttonType: type,
      buttonSizeMode: sizeMode,
      buttonLocale: locale,
      onClick: this._onClick.bind(this, googlePayment, paymentDataRequest),
    });

    const button = this.element.querySelector('#gpay-button-online-api-id');

    if (button) {
      button.style['min-width'] = 'auto';
    }
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    container.appendChild(this.element);

    if (classes.base) {
      container.classList.add(classes.base);
    }
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
   * @returns {google.payments.api.PaymentDataRequest}
   */
  _createPaymentRequestData(cart) {
    const {
      settings: { name },
    } = cart;

    const { require: { email, shipping, phone } = {} } = this.params;

    /** @type {google.payments.api.CallbackIntent[]} */
    const callbackIntents = ['OFFER'];

    if (shipping) {
      callbackIntents.push('SHIPPING_ADDRESS', 'SHIPPING_OPTION');
    }

    return {
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      transactionInfo: getTransactionInfo.call(this, cart),
      /**
       * @see {@link https://developer.paypal.com/braintree/docs/guides/google-pay/client-side/javascript/v3/#requesting-a-payment}
       *
       * Braintree automatically populates the `allowedPaymentMethods` property.
       */
      emailRequired: Boolean(email),
      shippingAddressRequired: Boolean(shipping),
      shippingAddressParameters: {
        phoneNumberRequired: Boolean(phone),
      },
      shippingOptionRequired: Boolean(shipping),
      shippingOptionParameters: getShippingOptionParameters.call(this, cart),
      offerInfo: getOfferInfo(cart),
      merchantInfo: {
        merchantName: name,
        merchantId: this.method.merchant_id,
      },
      callbackIntents,
    };
  }

  /**
   * @param {braintree.GooglePayment} googlePayment
   * @param {google.payments.api.PaymentDataRequest} paymentDataRequest
   */
  async _onClick(googlePayment, paymentDataRequest) {
    try {
      const paymentData =
        await this.googleClient.loadPaymentData(paymentDataRequest);

      if (paymentData) {
        await this._submitPayment(googlePayment, paymentData);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  /**
   * @param {braintree.GooglePayment} googlePayment
   * @param {google.payments.api.PaymentData} paymentData
   */
  async _submitPayment(googlePayment, paymentData) {
    const { nonce } = await googlePayment.parseResponse(paymentData);
    const { email, shippingAddress, shippingOptionData, paymentMethodData } =
      paymentData;
    const { info: { billingAddress } = {} } = paymentMethodData;

    const cart = await this.updateCart({
      account: {
        email,
      },
      billing: {
        method: 'google',
        account_card_id: null,
        card: null,
        google: {
          nonce,
          gateway: 'braintree',
        },
        ...convertToSwellAddress(billingAddress),
      },
      ...(shippingAddress && {
        shipping: {
          ...convertToSwellAddress(shippingAddress),
          service: shippingOptionData?.id || undefined,
        },
      }),
    });

    if (cart.subscription_delivery) {
      try {
        const card = await this.api.card.createToken({
          gateway: 'braintree',
          account_id: cart.account_id,
          nonce,
        });

        delete card.nonce;

        await this.updateCart({
          billing: {
            method: 'card',
            card,
            google: null,
          },
        });
      } catch (error) {
        console.warn('Failed to extract card data from google token', error);
      }
    }

    this.onSuccess();
  }
}
