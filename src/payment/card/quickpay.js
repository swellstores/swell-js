import Payment from '../payment';
import { UnableAuthenticatePaymentMethodError } from '../../utils/errors';

export default class QuickpayCardPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.card);
  }

  get orderId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async tokenize() {
    const cart = await this.getCart();
    const intent = await this.createIntent({
      gateway: 'quickpay',
      intent: {
        order_id: this.orderId,
        currency: cart.currency || 'USD',
      },
    });

    await this.updateCart({
      billing: {
        method: 'card',
        intent: {
          quickpay: {
            id: intent,
          },
        },
      },
    });

    const returnUrl = window.location.origin + window.location.pathname;
    const authorization = await this.authorizeGateway({
      gateway: 'quickpay',
      params: {
        action: 'create',
        continueurl: `${returnUrl}?gateway=quickpay&redirect_status=succeeded`,
        cancelurl: `${returnUrl}?gateway=quickpay&redirect_status=canceled`,
      },
    });

    if (authorization && authorization.url) {
      window.location.replace(authorization.url);
    }
  }

  async handleRedirect(queryParams) {
    const { redirect_status: status, card_id: id } = queryParams;

    switch (status) {
      case 'succeeded':
        return this._handleSuccessfulRedirect(id);
      case 'canceled':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${status}`);
    }
  }

  async _handleSuccessfulRedirect(cardId) {
    const card = await this.authorizeGateway({
      gateway: 'quickpay',
      params: { action: 'get', id: cardId },
    });

    if (card.error) {
      throw new Error(card.error.message);
    }

    await this.updateCart({
      billing: {
        method: 'card',
        card,
      },
    });

    this.onSuccess();
  }
}
