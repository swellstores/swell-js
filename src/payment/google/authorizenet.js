import Payment from '../payment';
import {
  getOfferInfo,
  getTransactionInfo,
  getShippingOptionParameters,
  convertToSwellAddress,
  onPaymentAuthorized,
  onPaymentDataChanged,
} from '../google';
import { isLiveMode, base64Encode } from '../../utils';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

/** @typedef {import('../../../types').Cart} Cart */

const API_VERSION = 2;
const API_MINOR_VERSION = 0;

const ALLOWED_CARD_AUTH_METHODS = Object.freeze(['PAN_ONLY', 'CRYPTOGRAM_3DS']);

const ALLOWED_CARD_NETWORKS = Object.freeze([
  'AMEX',
  'DISCOVER',
  'INTERAC',
  'JCB',
  'MASTERCARD',
  'VISA',
]);

export default class AuthorizeNetGooglePayment extends Payment {
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

  /** @returns {google.payments.api.PaymentsClient} */
  get googleClient() {
    if (!AuthorizeNetGooglePayment.googleClient) {
      if (this.google) {
        AuthorizeNetGooglePayment.googleClient =
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

      if (!AuthorizeNetGooglePayment.googleClient) {
        throw new LibraryNotLoadedError('Google client');
      }
    }

    return AuthorizeNetGooglePayment.googleClient;
  }

  /**
   * @param {boolean} [submit]
   * @returns {google.payments.api.PaymentMethodSpecification}
   */
  _getCardPaymentMethod(submit = false) {
    return {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ALLOWED_CARD_AUTH_METHODS,
        allowedCardNetworks: ALLOWED_CARD_NETWORKS,
        billingAddressRequired: true,
        billingAddressParameters: {
          format: 'FULL',
          phoneNumberRequired: true,
        },
      },
      ...(submit && {
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'authorizenet',
            gatewayMerchantId: this.method.gateway_merchant_id,
          },
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
   * @param {Cart} cart
   * @returns {google.payments.api.PaymentDataRequest}
   */
  _createPaymentRequestData(cart) {
    const {
      settings: { name },
      shipment_delivery,
    } = cart;

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
      merchantInfo: {
        merchantName: name,
        merchantId: this.method.merchant_id,
      },
      callbackIntents: [
        'OFFER',
        'SHIPPING_ADDRESS',
        'SHIPPING_OPTION',
        'PAYMENT_AUTHORIZATION',
      ],
    };
  }

  /** @param {google.payments.api.PaymentData} paymentData */
  async _submitPayment(paymentData) {
    const { require: { shipping: requireShipping } = {} } = this.params;
    const { email, shippingAddress, paymentMethodData } = paymentData;
    const {
      info: { billingAddress },
      tokenizationData: { token },
    } = paymentMethodData;

    await this.updateCart({
      account: {
        email,
      },
      billing: {
        method: 'google',
        account_card_id: null,
        card: null,
        google: {
          gateway: 'authorizenet',
          token: base64Encode(token),
        },
        ...convertToSwellAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: convertToSwellAddress(shippingAddress),
      }),
    });

    this.onSuccess();
  }

  /**
   * @param {google.payments.api.PaymentDataRequest} paymentDataRequest
   */
  _onClick(paymentDataRequest) {
    this.googleClient.loadPaymentData(paymentDataRequest);
  }

  /** @param {Cart} cart */
  async createElements(cart) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      style: { color = 'black', type = 'plain', sizeMode = 'fill' } = {},
    } = this.params;

    if (!this.method.merchant_id) {
      throw new Error('Google merchant ID is not defined');
    }

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

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

    const paymentDataRequest = this._createPaymentRequestData(cart);

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
