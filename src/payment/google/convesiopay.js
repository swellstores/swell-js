import { isLiveMode } from '../../utils';

import { convertToSwellAddress } from '../google';

import {
  getBrowserInfo,
  getConvesioErrorMessage,
  getConvesioPaymentSettings,
} from '../convesiopay';

import AbstractGooglePayment from './abstract';

/** @typedef {import('../../../types').Cart} Cart */

export default class ConvesioPayGooglePayment extends AbstractGooglePayment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods);

    this.convesiopay = methods.card;
  }

  /**
   * @override
   * @param {Cart} cart
   * @returns {Promise<google.payments.api.MerchantInfo>}
   */
  async getGooglePayMerchantInfo(cart) {
    const settings = await getConvesioPaymentSettings(
      this.method.mode,
      this.convesiopay,
      cart.settings?.country,
    );

    if (!settings) {
      throw new Error('ConvesioPay payment settings not found');
    }

    /** @type {google.payments.api.MerchantInfo} */
    const merchantInfo = {
      merchantName: settings.statementDescriptor,
    };

    if (isLiveMode(this.method.mode)) {
      merchantInfo.merchantId = settings.integrations?.gpay?.merchantId;
    }

    return merchantInfo;
  }

  /**
   * @override
   * @returns {google.payments.api.PaymentGatewayTokenizationParameters}
   */
  getPaymentGatewayTokenizationParameters() {
    return {
      gateway: 'verygoodsecurity',
      gatewayMerchantId: 'ACqLMqto2f7TqDE8MDrnd9Dv',
    };
  }

  /**
   * @override
   * @returns {google.payments.api.CardNetwork[]}
   */
  getAllowedCardNetworks() {
    return ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'];
  }

  /**
   * @override
   * @returns {google.payments.api.CardAuthMethod[]}
   */
  getAllowedCardAuthMethods() {
    return ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
  }

  /**
   * @override
   * @param {google.payments.api.PaymentData} paymentData
   * @returns {Promise<object>}
   */
  async preparePaymentDataForCartUpdate(paymentData) {
    const { require: { shipping: requireShipping } = {} } = this.params;
    const { email, shippingAddress, shippingOptionData, paymentMethodData } =
      paymentData;

    const {
      info: { billingAddress },
      tokenizationData: { token },
    } = paymentMethodData;

    const payment = await createConvesioGooglePaymentToken(
      this.method.mode,
      this.convesiopay,
      {
        paymentMethod: {
          type: 'googlepay',
        },
        google_pay_payload: {
          token: parseJsonToken(token),
        },
        browserInfo: getBrowserInfo(),
        origin: window.location.origin,
        billingContact:
          normalizeGooglePayContact(billingAddress, null) || undefined,
        shippingContact:
          normalizeGooglePayContact(shippingAddress, email) || undefined,
      },
    );

    return {
      account: { email },
      billing: {
        method: 'google',
        account_card_id: null,
        card: null,
        google: {
          gateway: 'convesiopay',
          token: payment.token || payment.paymentToken,
        },
        convesiopay: {
          return_url: this.params.returnUrl,
        },
        ...convertToSwellAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: {
          ...convertToSwellAddress(shippingAddress),
          service: shippingOptionData?.id || undefined,
        },
      }),
    };
  }
}

function parseJsonToken(token) {
  try {
    return JSON.parse(token);
  } catch {
    return token;
  }
}

function createConvesioGooglePaymentToken(mode, settings, data) {
  const baseUrl = isLiveMode(mode)
    ? 'https://vault-gpay.convesiopay.com'
    : 'https://qa-vault-gpay.convesiopay.com';

  return fetch(`${baseUrl}/v1/create-token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Api-Key': settings.public_key,
    },
    body: JSON.stringify(data),
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(
        (await getConvesioErrorMessage(res)) || 'Failed to create token',
      );
    }

    return res.json();
  });
}

function normalizeGooglePayContact(address, email) {
  if (!address) return null;

  const nameParts = (address.name || '').trim().split(/\s+/);
  const givenName = nameParts[0] || '';
  const familyName = nameParts.slice(1).join(' ') || '';

  const addressLines = [
    address.address1,
    address.address2,
    address.address3,
  ].filter(Boolean);

  return {
    givenName,
    familyName,
    addressLines,
    locality: address.locality || '',
    administrativeArea: address.administrativeArea || '',
    country: address.countryCode || '',
    countryCode: address.countryCode || '',
    postalCode: address.postalCode || '',
    subAdministrativeArea: '',
    subLocality: '',
    phoneticGivenName: '',
    phoneticFamilyName: '',
    ...(email && { emailAddress: email }),
    ...(address.phoneNumber && { phoneNumber: address.phoneNumber }),
  };
}
