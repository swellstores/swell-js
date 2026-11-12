import { isLiveMode } from '../utils';
import { UnableAuthenticatePaymentMethodError } from '../utils/errors';
import {
  getSaferpayPaymentPageData,
  getSaferpayCard,
  getSaferpayTransactionId,
  isSaferpayCardPayment,
  isSaferpayTwintPayment,
} from '../utils/saferpay';

import Payment from './payment';

/**
 * Saferpay payment page: `tokenize` sends the shopper to Saferpay, and
 * `handleRedirect` turns the returned transaction into the cart's billing.
 * The card and TWINT classes share it; each one handles only the redirect of
 * the method the cart was tokenized with, so a host can pass both.
 */
export default class SaferpayPayment extends Payment {
  constructor(api, options, params, methods, methodId) {
    super(api, options, params, methods[methodId]);
    this.methodId = methodId;
    this.cardMethod = methods.card;
  }

  async tokenize() {
    const cart = await this.getCart();

    // a card Saferpay already registered on this cart pays again without a new page visit
    if (
      this.methodId === 'card' &&
      cart.billing?.card?.gateway === 'saferpay' &&
      !this.params?.replace
    ) {
      return this.onSuccess();
    }

    const intent = await this.createIntent({
      gateway: 'saferpay',
      intent: getSaferpayPaymentPageData(cart, this.methodId),
    });

    if (!intent) {
      throw new Error('Saferpay payment page is not defined');
    }

    await this.updateCart({
      billing: {
        method: this.methodId,
        intent: {
          saferpay: {
            token: intent.token,
          },
        },
      },
    });

    window.location.replace(intent.redirect_url);
  }

  async handleRedirect(queryParams) {
    const { redirect_status: status } = queryParams;
    const cart = await this.getCart();

    // another Saferpay method of this host was tokenized: its instance answers
    if (cart.billing?.method !== this.methodId) {
      return;
    }

    switch (status) {
      case 'succeeded':
        return this._handleSuccessfulRedirect(cart);
      case 'canceled':
        return this.onCancel();
      case 'failed':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${status}.`);
    }
  }

  async _handleSuccessfulRedirect(cart) {
    const token = cart.billing?.intent?.saferpay?.token;

    if (!token) {
      throw new Error('Saferpay transaction token is not defined');
    }

    const intent = await this.updateIntent({
      gateway: 'saferpay',
      intent: { token },
    });

    if (!intent) {
      throw new Error('Saferpay transaction is not defined');
    }

    const { state } = intent;
    const transaction = { transaction_id: getSaferpayTransactionId(state) };

    if (isSaferpayCardPayment(state)) {
      const card = getSaferpayCard(state);

      if (!isLiveMode(this.cardMethod?.mode)) {
        card.test = true;
      }

      await this.updateCart({
        billing: { method: 'card', card, intent: { saferpay: transaction } },
      });
    } else if (isSaferpayTwintPayment(state)) {
      await this.updateCart({
        billing: { method: 'twint', intent: { saferpay: transaction } },
      });
    } else {
      throw new Error('Payment method not supported by this gateway.');
    }

    this.onSuccess();
  }
}
