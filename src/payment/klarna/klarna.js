import Payment from '../payment';
import { getKlarnaSessionData } from '../../utils/klarna';
import { UnableAuthenticatePaymentMethodError } from '../../utils/errors';

export default class KlarnaDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.klarna);
  }

  async tokenize() {
    const cart = await this.getCart();
    const sessionData = getKlarnaSessionData(cart);
    const session = await this.createIntent({
      gateway: 'klarna',
      intent: sessionData,
    });

    if (!session) {
      throw new Error('Klarna session is not defined');
    }

    window.location.replace(session.redirect_url);
  }

  async handleRedirect(queryParams) {
    const { authorization_token } = queryParams;

    if (!authorization_token) {
      throw new UnableAuthenticatePaymentMethodError();
    }

    await this.updateCart({
      billing: {
        method: 'klarna',
        klarna: {
          token: authorization_token,
        },
      },
    });

    this.onSuccess();
  }
}
