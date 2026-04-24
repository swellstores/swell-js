import { base64Encode } from '../../utils';

import { convertToSwellAddress } from '../google';

import AbstractGooglePayment from './abstract';

/** @typedef {import('../../../types').Cart} Cart */

export default class AuthorizeNetGooglePayment extends AbstractGooglePayment {
  /**
   * @override
   * @returns {google.payments.api.PaymentGatewayTokenizationParameters}
   */
  getPaymentGatewayTokenizationParameters() {
    return {
      gateway: 'authorizenet',
      gatewayMerchantId: this.method.gateway_merchant_id,
    };
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

    return {
      account: { email },
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
        shipping: {
          ...convertToSwellAddress(shippingAddress),
          service: shippingOptionData?.id || undefined,
        },
      }),
    };
  }
}
