import Payment from '../payment';
import {
  createElement,
  createPaymentMethod,
  isStripeChargeableAmount,
  stripeAmountByCurrency,
} from '../../utils/stripe';
import { LibraryNotLoadedError } from '../../utils/errors';

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */
/** @typedef {import('@stripe/stripe-js').StripeCardElement} StripeCardElement */
/** @typedef {import('@stripe/stripe-js').StripeCardNumberElement} StripeCardNumberElement */

export default class StripeCardPayment extends Payment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods.card);
  }

  get scripts() {
    return ['stripe-js'];
  }

  /** @returns {Stripe} */
  get stripe() {
    if (!StripeCardPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeCardPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeCardPayment.stripe;
  }

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeCardPayment.stripe = stripe;
  }

  /** @returns {StripeCardElement | StripeCardNumberElement} */
  get stripeElement() {
    return StripeCardPayment.stripeElement;
  }

  /** @param {StripeCardElement | StripeCardNumberElement} stripeElement */
  set stripeElement(stripeElement) {
    StripeCardPayment.stripeElement = stripeElement;
  }

  async createElements() {
    await this.loadScripts(this.scripts);

    const elements = this.stripe.elements(this.params.config);

    if (this.params.separateElements) {
      this.stripeElement = createElement('cardNumber', elements, this.params);
      createElement('cardExpiry', elements, this.params);
      createElement('cardCvc', elements, this.params);
    } else {
      this.stripeElement = createElement('card', elements, this.params);
    }
  }

  async tokenize() {
    if (!this.stripeElement) {
      throw new Error('Stripe payment element is not defined');
    }

    await this.loadScripts(this.scripts);

    const cart = await this.getCart();
    const paymentMethod = await createPaymentMethod(
      this.stripe,
      this.stripeElement,
      cart,
    );

    if (paymentMethod.error) {
      throw new Error(paymentMethod.error.message);
    }

    // should save payment method data when payment amount is not chargeable
    if (!isStripeChargeableAmount(cart.capture_total, cart.currency)) {
      await this.updateCart({
        billing: {
          method: 'card',
          card: paymentMethod,
        },
      });

      return this.onSuccess();
    }

    const intent = await this._createIntent(cart, paymentMethod);

    await this.updateCart({
      billing: {
        method: 'card',
        card: paymentMethod,
        intent: {
          stripe: {
            id: intent.id,
            ...(Boolean(cart.auth_total) && {
              auth_amount: cart.auth_total,
            }),
          },
        },
      },
    });

    this.onSuccess();
  }

  async authenticate(payment) {
    const { transaction_id: id, card: { token } = {} } = payment;

    const intent = await this.updateIntent({
      gateway: 'stripe',
      intent: { id, payment_method: token },
    });

    if (intent.error) {
      throw new Error(intent.error.message);
    }

    await this.loadScripts(this.scripts);

    try {
      const result = await this._confirmCardPayment(intent);

      return result;
    } finally {
      await this.resetAsyncPayment(payment.id);
    }
  }

  async _createIntent(cart, paymentMethod) {
    const { account, currency, capture_total, auth_total } = cart;
    const stripeCustomer = account && account.stripe_customer;
    const stripeCurrency = (currency || 'USD').toLowerCase();
    const amount = stripeAmountByCurrency(currency, capture_total + auth_total);
    const intent = await this.createIntent({
      gateway: 'stripe',
      intent: {
        amount,
        currency: stripeCurrency,
        payment_method: paymentMethod.token,
        capture_method: 'manual',
        setup_future_usage: 'off_session',
        ...(stripeCustomer ? { customer: stripeCustomer } : {}),
      },
    });

    if (!intent) {
      throw new Error('Stripe payment intent is not defined');
    }

    switch (intent.status) {
      case 'requires_capture':
      case 'requires_confirmation':
        break;

      default:
        throw new Error(`Unsupported intent status: ${intent.status}`);
    }

    // Confirm the payment intent
    if (intent.status === 'requires_confirmation') {
      await this._confirmCardPayment(intent);
    }

    return intent;
  }

  async _confirmCardPayment(intent) {
    const actionResult = await this.stripe.confirmCardPayment(
      intent.client_secret,
    );

    if (actionResult.error) {
      throw new Error(actionResult.error.message);
    }

    return { status: actionResult.paymentIntent.status };
  }
}
