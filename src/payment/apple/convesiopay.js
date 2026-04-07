import { isLiveMode } from '../../utils';

import { convertToSwellAddress } from '../apple';

import {
  getBrowserInfo,
  getBaseConvesioApiUrl,
  getConvesioPaymentSettings,
} from '../convesiopay';

import AbstractApplePayment from './abstract';

/** @typedef {import('../../../types').Cart} Cart */

export default class ConvesioPayApplePayment extends AbstractApplePayment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods);

    this.convesiopay = methods.card;
  }

  /**
   * @override
   * @returns {string[]}
   */
  getSupportedCardNetworks() {
    return ['visa', 'masterCard', 'amex', 'discover'];
  }

  /**
   * @override
   * @returns {ApplePayJS.ApplePayMerchantCapability[]}
   */
  getMerchantCapabilities() {
    return ['supports3DS'];
  }

  /**
   * @override
   * @param {Cart} cart
   */
  async getApplePayMerchantInfo(cart) {
    const settings = await getConvesioPaymentSettings(
      this.method.mode,
      this.convesiopay,
      cart.settings?.country,
    );

    if (!settings) {
      throw new Error('ConvesioPay payment settings not found');
    }

    this.merchantInfo = {
      displayName: settings.statementDescriptor || cart.settings.name || '',
    };
  }

  /**
   * @override
   * @param {ApplePayJS.ApplePayValidateMerchantEvent} event
   */
  async createMerchantSession(event) {
    return createMerchantApplePaySession(
      this.method.mode,
      this.convesiopay,
      event.validationURL,
      this.merchantInfo.displayName,
    );
  }

  /**
   * @override
   * @param {ApplePayJS.ApplePayPaymentAuthorizedEvent} event
   * @returns {Promise<object>}
   */
  async preparePaymentDataForCartUpdate(event) {
    const {
      payment: { token, shippingContact, billingContact },
    } = event;

    const { require: { shipping: requireShipping } = {} } = this.params;

    const payment = await createConvesioApplePaymentToken(
      this.method.mode,
      this.convesiopay,
      {
        paymentMethod: {
          type: 'applepay',
        },
        token: {
          paymentData: token.paymentData,
          paymentMethod: token.paymentMethod,
          transactionIdentifier: token.transactionIdentifier,
        },
        browserInfo: getBrowserInfo(),
        origin: window.location.origin,
        billingContact: billingContact || undefined,
        shippingContact: shippingContact || undefined,
      },
    );

    return {
      account: {
        email: shippingContact.emailAddress,
      },
      billing: {
        method: 'apple',
        account_card_id: null,
        card: null,
        apple: {
          gateway: 'convesiopay',
          token: payment.token || payment.paymentToken,
        },
        convesiopay: {
          return_url: this.params.returnUrl,
        },
        ...convertToSwellAddress(billingContact),
      },
      ...(requireShipping && {
        shipping: convertToSwellAddress(shippingContact),
      }),
    };
  }
}

async function createMerchantApplePaySession(
  mode,
  settings,
  validationURL,
  displayName,
) {
  const baseUrl = getBaseConvesioApiUrl(mode);

  const response = await fetch(`${baseUrl}/v1/applepay/session`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Api-Key': settings.public_key,
    },
    body: JSON.stringify({
      validationURL,
      displayName,
      initiativeContext: window.location.hostname,
    }),
  });

  if (!response.ok) {
    throw new Error(`Merchant validation failed: ${response.status}`);
  }

  return response.json();
}

function createConvesioApplePaymentToken(mode, settings, data) {
  const baseUrl = isLiveMode(mode)
    ? 'https://vault-apay.convesiopay.com'
    : 'https://qa-vault-apay.convesiopay.com';

  return fetch(`${baseUrl}/v1/create-token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Api-Key': settings.public_key,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());
}
