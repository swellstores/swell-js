import Payment from '../payment';
import {
  getKlarnaIntentDetails,
  getKlarnaConfirmationDetails,
} from '../../utils/stripe';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
  UnableAuthenticatePaymentMethodError,
} from '../../utils/errors';

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */

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

  /** @returns {Stripe} */
  get stripe() {
    if (!StripeKlarnaPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeKlarnaPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeKlarnaPayment.stripe;
  }

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeKlarnaPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const intent = await this.createIntent({
      gateway: 'stripe',
      intent: getKlarnaIntentDetails(cart),
    });

    await this.loadScripts(this.scripts);

    const { error } = await this.stripe.confirmKlarnaPayment(
      intent.client_secret,
      getKlarnaConfirmationDetails(cart),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async handleRedirect(queryParams) {
    const { redirect_status, payment_intent_client_secret } = queryParams;

    if (redirect_status !== 'succeeded') {
      throw new UnableAuthenticatePaymentMethodError();
    }

    await this.loadScripts(this.scripts);

    const { paymentIntent, error } = await this.stripe.retrievePaymentIntent(
      payment_intent_client_secret,
    );

    if (error) {
      throw new Error(error.message);
    }

    await this.updateCart({
      billing: {
        method: 'klarna',
        klarna: {
          token: paymentIntent.payment_method,
        },
        intent: {
          stripe: {
            id: paymentIntent.id,
          },
        },
      },
    });

    this.onSuccess();
  }
}
