import cardApi from '../../card';
import { isLiveMode } from '../../utils';

import Payment from '../payment';

/**
 * Card gateways without an element (Braintree, Authorize.Net, the test
 * gateway): the host collects the card and `tokenize({ card: { data } })`
 * tokenizes it through the vault and stores it on the cart.
 */
export default class VaultCardPayment extends Payment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods.card);
  }

  async tokenize() {
    const { data, billing } = this.params;

    if (!data) {
      throw new Error(
        'Card details are missing in `swell.payment.tokenize({ card: { data } })`',
      );
    }

    const cart = await this.getCart();
    const card = await cardApi(this.options).createToken({
      account_id: cart.account_id,
      billing,
      ...data,
    });

    if (!isLiveMode(this.method.mode)) {
      card.test = true;
    }

    if (!card.gateway) {
      card.gateway = this.method.gateway;
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
