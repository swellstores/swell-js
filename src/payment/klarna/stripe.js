import Payment from '../payment';
import { createKlarnaSource } from '../../utils/stripe';
import {
  PaymentMethodDisabledError,
  LibraryNotLoaded,
} from '../../utils/errors';

export default class StripeKlarnaPayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.klarna,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeKlarnaPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeKlarnaPayment.stripe) {
        throw new LibraryNotLoaded('Stripe');
      }
    }

    return StripeKlarnaPayment.stripe;
  }

  set stripe(stripe) {
    StripeKlarnaPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const settings = await this.getSettings();
    const { source, error: sourceError } = await createKlarnaSource(
      this.stripe,
      {
        ...cart,
        settings: settings.store,
      },
    );

    if (sourceError) {
      throw new Error(sourceError.message);
    }

    await this.updateCart({
      billing: {
        method: 'klarna',
      },
    });

    window.location.replace(source.redirect.url);
  }
}
