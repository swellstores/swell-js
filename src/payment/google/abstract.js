import { isLiveMode } from '../../utils';

import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

import {
  getOfferInfo,
  getTransactionInfo,
  getShippingOptionParameters,
  onPaymentAuthorized,
  onPaymentDataChanged,
} from '../google';

import Payment from '../payment';

/** @typedef {import('../../../types').Cart} Cart */

const API_VERSION = 2;
const API_MINOR_VERSION = 0;

export default class AbstractGooglePayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(api, options, params, methods.google);
  }

  get scripts() {
    return ['google-pay'];
  }

  get google() {
    if (!window.google) {
      throw new LibraryNotLoadedError('Google');
    }

    return window.google;
  }

  /**
   * Gets the Google Pay client instance, creating one if it doesn't exist.
   * Each instance creates its own client to ensure proper callback binding.
   * @returns {google.payments.api.PaymentsClient}
   */
  get googleClient() {
    if (!this._googleClientInstance) {
      if (this.google) {
        this._googleClientInstance =
          new this.google.payments.api.PaymentsClient({
            environment: isLiveMode(this.method.mode) ? 'PRODUCTION' : 'TEST',
            paymentDataCallbacks: {
              onPaymentAuthorized: onPaymentAuthorized.bind(
                this,
                this._submitPayment.bind(this),
              ),
              onPaymentDataChanged: onPaymentDataChanged.bind(this),
            },
          });
      }

      if (!this._googleClientInstance) {
        throw new LibraryNotLoadedError('Google client');
      }
    }

    return this._googleClientInstance;
  }

  /**
   * @param {Cart} cart
   * @returns {Promise<google.payments.api.MerchantInfo>}
   */
  async getGooglePayMerchantInfo(cart) {
    const {
      settings: { name },
    } = cart;

    /** @type {google.payments.api.MerchantInfo} */
    const merchantInfo = {
      merchantName: name,
    };

    if (isLiveMode(this.method.mode)) {
      merchantInfo.merchantId = this.method.merchant_id;
    }

    return merchantInfo;
  }

  /** @returns {google.payments.api.PaymentGatewayTokenizationParameters} */
  getPaymentGatewayTokenizationParameters() {
    throw new Error('Implement this!');
  }

  /** @returns {google.payments.api.CardNetwork[]} */
  getAllowedCardNetworks() {
    return ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'];
  }

  /** @returns {google.payments.api.CardAuthMethod[]} */
  getAllowedCardAuthMethods() {
    return ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
  }

  /**
   * @param {boolean} [submit]
   * @returns {google.payments.api.PaymentMethodSpecification}
   */
  _getCardPaymentMethod(submit = false) {
    return {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: this.getAllowedCardAuthMethods(),
        allowedCardNetworks: this.getAllowedCardNetworks(),
        billingAddressRequired: true,
        billingAddressParameters: {
          format: 'FULL',
          phoneNumberRequired: true,
        },
      },
      ...(submit && {
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: this.getPaymentGatewayTokenizationParameters(),
        },
      }),
    };
  }

  /**
   * @param {boolean} [submit]
   * @returns {google.payments.api.PaymentMethodSpecification[]}
   */
  _getAllowedPaymentMethods(submit = false) {
    return [this._getCardPaymentMethod(submit)];
  }

  /**
   * Creates the payment data request object for Google Pay.
   * @param {Cart} cart - The current cart data
   * @param {google.payments.api.MerchantInfo} merchantInfo
   * @returns {google.payments.api.PaymentDataRequest} Payment data request object
   */
  _createPaymentRequestData(cart, merchantInfo) {
    cart = { ...cart };
    // When initiating a payment request,
    // we should not set the final price, otherwise problems may arise.
    cart.shipment_price = 0;
    cart.shipping = {};

    const { shipment_delivery } = cart;
    const { require: { email, shipping, phone } = {} } = this.params;

    return {
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      transactionInfo: getTransactionInfo(cart),
      allowedPaymentMethods: this._getAllowedPaymentMethods(true),
      emailRequired: Boolean(email),
      shippingAddressRequired: Boolean(shipping),
      shippingAddressParameters: {
        phoneNumberRequired: Boolean(phone),
      },
      shippingOptionRequired: Boolean(shipment_delivery),
      shippingOptionParameters: getShippingOptionParameters.call(this, cart),
      offerInfo: getOfferInfo(cart),
      merchantInfo,
      callbackIntents: [
        'OFFER',
        'SHIPPING_ADDRESS',
        'SHIPPING_OPTION',
        'PAYMENT_AUTHORIZATION',
      ],
    };
  }

  /**
   * @param {google.payments.api.PaymentData} paymentData
   * @returns {Promise<object>}
   */
  // eslint-disable-next-line no-unused-vars
  async preparePaymentDataForCartUpdate(paymentData) {
    throw new Error('Implement this!');
  }

  /** @param {google.payments.api.PaymentData} paymentData */
  async _submitPayment(paymentData) {
    const { paymentMethodData } = paymentData;

    // Validate payment method data structure
    if (
      !paymentMethodData ||
      !paymentMethodData.info ||
      !paymentMethodData.tokenizationData
    ) {
      throw new Error('Invalid payment method data structure');
    }

    // Ensure token exists
    if (!paymentMethodData.tokenizationData.token) {
      throw new Error('Google Pay token is missing');
    }

    await this.preparePaymentDataForCartUpdate(paymentData).then((data) =>
      this.updateCart(data),
    );

    this.onSuccess();
  }

  /**
   * Handles the click event on the Google Pay button.
   *
   * @param {google.payments.api.PaymentDataRequest} paymentDataRequest
   */
  async _onClick(paymentDataRequest) {
    try {
      // This must be called directly from user gesture to avoid popup blockers
      await this.googleClient.loadPaymentData(paymentDataRequest);
    } catch (error) {
      // Check if user closed the payment request
      if (typeof error === 'object' && error !== null) {
        if (error.statusCode === 'CANCELED') {
          // User cancelled - this is not an error
          return;
        }
      }

      this.onError(error);
    }
  }

  /** @param {Cart} cart */
  async createElements(cart) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      style: { color = 'black', type = 'plain', sizeMode = 'fill' } = {},
    } = this.params;

    this.setElementContainer(elementId);

    const [merchantInfo] = await Promise.all([
      this.getGooglePayMerchantInfo(cart),
      this.loadScripts(this.scripts),
    ]);

    const isReadyToPay = await this.googleClient.isReadyToPay({
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      allowedPaymentMethods: this._getAllowedPaymentMethods(false),
      existingPaymentMethodRequired: true,
    });

    if (!isReadyToPay.result) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    const paymentDataRequest = this._createPaymentRequestData(
      cart,
      merchantInfo,
    );

    this.element = this.googleClient.createButton({
      buttonColor: color,
      buttonType: type,
      buttonSizeMode: sizeMode,
      buttonLocale: locale,
      allowedPaymentMethods: this._getAllowedPaymentMethods(false),
      onClick: this._onClick.bind(this, paymentDataRequest),
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
}
