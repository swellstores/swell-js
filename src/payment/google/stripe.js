import Payment from '../payment';
import { isLiveMode } from '../../utils';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
  DomElementNotFoundError,
} from '../../utils/errors';

const VERSION = '2018-10-31';
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

export default class StripeGooglePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.google,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
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

  get googleClient() {
    if (!StripeGooglePayment.googleClient) {
      if (this.google) {
        this.googleClient = new this.google.payments.api.PaymentsClient({
          environment: isLiveMode(this.method.mode) ? 'PRODUCTION' : 'TEST',
        });
      }

      if (!StripeGooglePayment.googleClient) {
        throw new LibraryNotLoadedError('Google client');
      }
    }

    return StripeGooglePayment.googleClient;
  }

  set googleClient(googleClient) {
    StripeGooglePayment.googleClient = googleClient;
  }

  get tokenizationSpecification() {
    const publishableKey = this.method.publishable_key;

    if (!publishableKey) {
      throw new Error('Stripe publishable key is not defined');
    }

    return {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'stripe',
        'stripe:version': VERSION,
        'stripe:publishableKey': publishableKey,
      },
    };
  }

  get cardPaymentMethod() {
    return {
      type: 'CARD',
      tokenizationSpecification: this.tokenizationSpecification,
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

  get allowedPaymentMethods() {
    return [this.cardPaymentMethod];
  }

  async createElements() {
    if (!this.method.merchant_id) {
      throw new Error('Google merchant ID is not defined');
    }

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

    const cart = await this.getCart();
    const paymentRequestData = this._createPaymentRequestData(cart);

    this._renderButton(paymentRequestData);
  }

  _createPaymentRequestData(cart) {
    const {
      settings: { name },
      capture_total,
      currency,
    } = cart;
    const { require: { email, shipping, phone } = {} } = this.params;

    return {
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      transactionInfo: {
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

  _renderButton(paymentRequestData) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      style: { color = 'black', type = 'buy', sizeMode = 'fill' } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    if (classes.base) {
      container.classList.add(classes.base);
    }

    const button = this.googleClient.createButton({
      buttonColor: color,
      buttonType: type,
      buttonSizeMode: sizeMode,
      buttonLocale: locale,
      onClick: this._onClick.bind(this, paymentRequestData),
    });

    container.appendChild(button);
  }

  async _onClick(paymentRequestData) {
    try {
      const paymentData = await this.googleClient.loadPaymentData(
        paymentRequestData,
      );

      if (paymentData) {
        await this._submitPayment(paymentData);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  async _submitPayment(paymentData) {
    const { require: { shipping: requireShipping } = {} } = this.params;
    const { email, shippingAddress, paymentMethodData } = paymentData;
    const {
      info: { billingAddress },
      tokenizationData,
    } = paymentMethodData;
    const token = JSON.parse(tokenizationData.token);
    const { card } = token;

    await this.updateCart({
      account: {
        email,
        name: shippingAddress ? shippingAddress.name : billingAddress.name,
      },
      billing: {
        method: 'card',
        card: {
          token: token.id,
          brand: card.brand,
          last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          gateway: 'stripe',
        },
        ...this._mapAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: this._mapAddress(shippingAddress),
      }),
    });

    this.onSuccess();
  }

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
