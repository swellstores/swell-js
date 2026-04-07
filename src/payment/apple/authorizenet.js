import { base64Encode } from '../../utils';

import { convertToSwellAddress } from '../apple';

import AbstractApplePayment from './abstract';

export default class AuthorizeNetApplePayment extends AbstractApplePayment {
  /**
   * @override
   * @param {ApplePayJS.ApplePayValidateMerchantEvent} event
   */
  async createMerchantSession(event) {
    const merchantSession = await this.authorizeGateway({
      gateway: 'authorizenet',
      params: {
        method: 'apple',
        merchantIdentifier: this.method.merchant_id,
        validationURL: event.validationURL,
        displayName: this.merchantInfo.displayName,
        domainName: window.location.hostname,
      },
    });

    if (merchantSession?.error) {
      throw new Error(merchantSession.error.message);
    }

    return merchantSession;
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

    return {
      account: {
        email: shippingContact.emailAddress,
      },
      billing: {
        method: 'apple',
        account_card_id: null,
        card: null,
        apple: {
          gateway: 'authorizenet',
          token: base64Encode(JSON.stringify(token.paymentData)),
        },
        ...convertToSwellAddress(billingContact),
      },
      ...(requireShipping && {
        shipping: convertToSwellAddress(shippingContact),
      }),
    };
  }
}
