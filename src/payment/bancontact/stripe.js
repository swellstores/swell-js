import Payment from '../payment';
import { createBancontactSource } from '../../utils/stripe';
import {
  PaymentMethodDisabledError,
  LibraryNotLoaded,
} from '../../utils/errors';

export default class StripeBancontactPayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.bancontact,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeBancontactPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeBancontactPayment.stripe) {
        throw new LibraryNotLoaded('Stripe');
      }
    }

    return StripeBancontactPayment.stripe;
  }

  set stripe(stripe) {
    StripeBancontactPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const { source, error: sourceError } = await createBancontactSource(
      this.stripe,
      cart,
    );

    if (sourceError) {
      throw new Error(sourceError.message);
    }

    await this.updateCart({
      billing: {
        method: 'bancontact',
      },
    });

    window.location.replace(source.redirect.url);
  }
}
