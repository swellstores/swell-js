import Payment from '../payment';
import { getBancontactConfirmationDetails } from '../../utils/stripe';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
  UnableAuthenticatePaymentMethodError,
} from '../../utils/errors';

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */

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

  /** @returns {Stripe} */
  get stripe() {
    if (!StripeBancontactPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeBancontactPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeBancontactPayment.stripe;
  }

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeBancontactPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const intent = await this.createIntent({
      gateway: 'stripe',
      action: 'setup',
      account_id: cart.account_id,
      intent: {
        payment_method_types: ['bancontact'],
        usage: 'off_session',
      },
    });

    await this.loadScripts(this.scripts);

    const { error } = await this.stripe.confirmBancontactSetup(
      intent.client_secret,
      getBancontactConfirmationDetails(cart),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async handleRedirect(queryParams) {
    const { redirect_status, setup_intent_client_secret } = queryParams;

    if (redirect_status !== 'succeeded') {
      throw new UnableAuthenticatePaymentMethodError();
    }

    await this.loadScripts(this.scripts);

    const { setupIntent, error } = await this.stripe.retrieveSetupIntent(
      setup_intent_client_secret,
    );

    if (error) {
      throw new Error(error.message);
    }

    await this.updateCart({
      billing: {
        method: 'bancontact',
        bancontact: {
          token: setupIntent.id,
        },
      },
    });

    this.onSuccess();
  }
}
