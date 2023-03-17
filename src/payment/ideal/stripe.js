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

export default class StripeIDealPayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.ideal,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

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

  set stripe(stripe) {
    StripeIDealPayment.stripe = stripe;
  }

  get stripeElement() {
    return StripeIDealPayment.stripeElement;
  }

  set stripeElement(stripeElement) {
    StripeIDealPayment.stripeElement = stripeElement;
  }

  async createElements() {
    const elements = this.stripe.elements(this.params.config);

    this.stripeElement = createElement('idealBank', elements, this.params);
  }

  async tokenize() {
    if (!this.stripeElement) {
      throw new Error('Stripe payment element is not defined');
    }

    const cart = await this.getCart();
    const { paymentMethod, error: paymentMethodError } =
      await createIDealPaymentMethod(this.stripe, this.stripeElement, cart);

    if (paymentMethodError) {
      throw new Error(paymentMethodError.message);
    }

    const intent = await this._createIntent(cart, paymentMethod);

    await this.stripe.handleCardAction(intent.client_secret);
  }

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
