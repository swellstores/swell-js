import Payment from '../payment';
import { isLiveMode } from '../../utils';
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

  /** @returns {google.payments.api.PaymentMethodSpecification} */
  get cardPaymentMethod() {
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
    };
  }

  /** @returns {google.payments.api.PaymentMethodSpecification[]} */
  get allowedPaymentMethods() {
    return [this.cardPaymentMethod];
  }

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
      allowedPaymentMethods: this.allowedPaymentMethods,
      existingPaymentMethodRequired: true,
    });

    if (!isReadyToPay.result) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    const braintreeClient = await this._createBraintreeClient();
    const googlePayment = await this.braintree.googlePayment.create({
      client: braintreeClient,
      googleMerchantId: this.method.merchant_id,
      googlePayVersion: API_VERSION,
    });
    const paymentRequestData = this._createPaymentRequestData(cart);
    const paymentDataRequest =
      googlePayment.createPaymentDataRequest(paymentRequestData);

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

  /** @returns {google.payments.api.PaymentDataRequest} */
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
      allowedPaymentMethods: this.allowedPaymentMethods,
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

  /**
   * @param {object} googlePayment
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
   * @param {object} googlePayment
   * @param {google.payments.api.PaymentData} paymentData
   */
  async _submitPayment(googlePayment, paymentData) {
    const { require: { shipping: requireShipping } = {} } = this.params;
    const { nonce } = await googlePayment.parseResponse(paymentData);
    const { email, shippingAddress, paymentMethodData } = paymentData;
    const {
      info: { billingAddress },
    } = paymentMethodData;

    await this.updateCart({
      account: {
        email,
      },
      billing: {
        method: 'google',
        google: {
          nonce,
          gateway: 'braintree',
        },
        ...this._mapAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: this._mapAddress(shippingAddress),
      }),
    });

    this.onSuccess();
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
}
