import Payment from '../payment';
import {
  createElement,
  createIDealPaymentMethod,
  stripeAmountByCurrency,
} from '../../utils/stripe';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */
/** @typedef {import('@stripe/stripe-js').StripeIdealBankElement} StripeIdealBankElement */

export default class StripeIDealPayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.ideal,
      publishable_key: methods.card.publishable_key,
    };

    super(api, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  /** @returns {Stripe} */
  get stripe() {
    if (!StripeIDealPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeIDealPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeIDealPayment.stripe;
  }

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeIDealPayment.stripe = stripe;
  }

  /** @returns {StripeIdealBankElement} */
  get stripeElement() {
    return StripeIDealPayment.stripeElement;
  }

  /** @param {StripeIdealBankElement} stripeElement */
  set stripeElement(stripeElement) {
    StripeIDealPayment.stripeElement = stripeElement;
  }

  async createElements() {
    await this.loadScripts(this.scripts);

    const elements = this.stripe.elements(this.params.config);

    this.stripeElement = createElement('idealBank', elements, this.params);
  }

  async tokenize() {
    if (!this.stripeElement) {
      throw new Error('Stripe payment element is not defined');
    }

    await this.loadScripts(this.scripts);

    const cart = await this.getCart();
    const { paymentMethod, error: paymentMethodError } =
      await createIDealPaymentMethod(this.stripe, this.stripeElement, cart);

    if (paymentMethodError) {
      throw new Error(paymentMethodError.message);
    }

    const intent = await this._createIntent(cart, paymentMethod);

    await this.stripe.handleCardAction(intent.client_secret);
  }

  /**
   * @param {object} cart
   * @param {import('@stripe/stripe-js').PaymentMethod} paymentMethod
   */
  async _createIntent(cart, paymentMethod) {
    const { currency, capture_total } = cart;
    const stripeCurrency = (currency || 'EUR').toLowerCase();
    const amount = stripeAmountByCurrency(currency, capture_total);
    const intent = await this.createIntent({
      gateway: 'stripe',
      intent: {
        amount,
        currency: stripeCurrency,
        payment_method: paymentMethod.id,
        payment_method_types: 'ideal',
        confirmation_method: 'manual',
        confirm: true,
        return_url: window.location.href,
      },
    });

    if (!intent) {
      throw new Error('Stripe payment intent is not defined');
    }

    if (
      !['requires_action', 'requires_source_action'].includes(intent.status)
    ) {
      throw new Error(`Unsupported intent status (${intent.status})`);
    }

    await this.updateCart({
      billing: {
        method: 'ideal',
        ideal: {
          token: paymentMethod.id,
        },
        intent: {
          stripe: {
            id: intent.id,
          },
        },
      },
    });

    return intent;
  }
}
