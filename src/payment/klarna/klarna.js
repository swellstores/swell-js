import { UnableAuthenticatePaymentMethodError } from '../../utils/errors';

import Payment from '../payment';

export default class KlarnaDirectPayment extends Payment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods.klarna);
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

function getKlarnaSessionData(cart) {
  const returnUrl = `${window.location.origin}${window.location.pathname}?gateway=klarna_direct&sid={{session_id}}`;
  const successUrl = `${returnUrl}&authorization_token={{authorization_token}}`;

  return {
    cart_id: cart.id,
    merchant_urls: {
      success: successUrl,
      back: returnUrl,
      cancel: returnUrl,
      error: returnUrl,
      failure: returnUrl,
    },
  };
}
