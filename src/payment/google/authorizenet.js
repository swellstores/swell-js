import Payment from '../payment';
import { isLiveMode, base64Encode } from '../../utils';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

const API_VERSION = 2;
const API_MINOR_VERSION = 0;

const ALLOWED_CARD_AUTH_METHODS = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

const ALLOWED_CARD_NETWORKS = [
  'AMEX',
  'DISCOVER',
  'INTERAC',
  'JCB',
  'MASTERCARD',
  'VISA',
];

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
   * @returns {google.payments.api.PaymentMethodSpecification[]}
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
   * @param {import('../../../types').Cart} cart
   * @returns {google.payments.api.PaymentDataRequest}
   */
  _createPaymentRequestData(cart) {
    const {
      settings: { name, country },
      capture_total,
      currency,
    } = cart;

    const { require: { email, shipping, phone } = {} } = this.params;

    return {
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      transactionInfo: {
        countryCode: country,
        currencyCode: currency,
        totalPrice: capture_total.toString(),
        totalPriceStatus: 'ESTIMATED',
      },
      allowedPaymentMethods: this._getAllowedPaymentMethods(true),
      emailRequired: Boolean(email),
      shippingAddressRequired: Boolean(shipping),
      shippingAddressParameters: {
        phoneNumberRequired: Boolean(phone),
      },
      merchantInfo: {
        merchantName: name,
        merchantId: this.method.merchant_id,
      },
    };
  }

  /** @param {google.payments.api.Address} address */
  _mapAddress(address) {
    return {
      name: address.name,
      address1: address.address1,
      address2: address.address2,
      city: address.locality,
      state: address.administrativeArea,
      zip: address.postalCode,
      country: address.countryCode,
      phone: address.phoneNumber,
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
        google: {
          gateway: 'authorizenet',
          token: base64Encode(token),
        },
        ...this._mapAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: this._mapAddress(shippingAddress),
      }),
    });

    this.onSuccess();
  }

  /**
   * @param {google.payments.api.PaymentDataRequest} paymentDataRequest
   */
  async _onClick(paymentDataRequest) {
    try {
      const paymentData =
        await this.googleClient.loadPaymentData(paymentDataRequest);

      if (paymentData) {
        await this._submitPayment(paymentData);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  /** @param {import('../../../types').Cart} cart */
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
