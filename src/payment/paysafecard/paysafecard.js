import Payment from '../payment';
import { get } from '../../utils';
import { createPaysafecardPaymentData } from '../../utils/paysafecard';
import { UnableAuthenticatePaymentMethodError } from '../../utils/errors';

export default class PaysafecardDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paysafecard);
  }

  async tokenize() {
    const cart = await this.getCart();
    const intentData = createPaysafecardPaymentData(cart);
    const intent = await this.createIntent({
      gateway: 'paysafecard',
      intent: intentData,
    });

    if (!intent) {
      throw new Error('Paysafecard payment is not defined');
    }

    await this.updateCart({
      billing: {
        method: 'paysafecard',
        intent: {
          paysafecard: {
            id: intent.id,
          },
        },
      },
    });

    window.location.replace(intent.redirect.auth_url);
  }

  async handleRedirect() {
    const cart = await this.getCart();
    const paymentId = get(cart, 'billing.intent.paysafecard.id');

    if (!paymentId) {
      throw new Error('Paysafecard payment ID is not defined');
    }

    const intent = await this.updateIntent({
      gateway: 'paysafecard',
      intent: { payment_id: paymentId },
    });

    if (!intent) {
      throw new Error('Paysafecard payment is not defined');
    }

    switch (intent.status) {
      case 'SUCCESS':
      case 'AUTHORIZED':
        return this.onSuccess();
      case 'CANCELED_CUSTOMER':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${intent.status}.`);
    }
  }
}
