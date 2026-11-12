import { isLiveMode } from '../../utils';
import { LibraryNotLoadedError } from '../../utils/errors';

import {
  createCardPaymentMethodFromElements,
  createElement,
  createPaymentElements,
  createPaymentMethod,
  getCardElementsOptions,
  isStripeChargeableAmount,
  stripeAmountByCurrency,
} from '../../utils/stripe';

import Payment from '../payment';

// The cart keeps what checkout v1 keeps, so the next tokenize can retrieve and reuse
// the intent; the vault cancels the replaced ones when the order is paid
const cartIntent = (cart, intent) => {
  const exIntent = cart.billing?.intent?.stripe;

  return {
    id: intent.id,
    client_secret: intent.client_secret,
    amount: intent.amount,
    currency: intent.currency,
    ...(Boolean(cart.auth_total) && { auth_amount: cart.auth_total }),
    ...(exIntent?.id &&
      exIntent.id !== intent.id && {
        canceled: [...(exIntent.canceled || []), exIntent.id],
      }),
  };
};

const intentAmount = ({ currency, capture_total, auth_total }) =>
  stripeAmountByCurrency(currency, capture_total + auth_total);

const intentCurrency = ({ currency }) => (currency || 'USD').toLowerCase();

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

  /** @returns {import('@stripe/stripe-js').StripeElements} */
  get stripeElements() {
    return StripeCardPayment.stripeElements;
  }

  /** @param {import('@stripe/stripe-js').StripeElements} stripeElements */
  set stripeElements(stripeElements) {
    StripeCardPayment.stripeElements = stripeElements;
  }

  /** @param {import('../../../types').Cart} cart */
  async createElements(cart) {
    await this.loadScripts(this.scripts);

    if (this.params.paymentElement) {
      this.stripeElements = createPaymentElements(
        this.stripe,
        getCardElementsOptions(cart),
        this.params,
      );

      return;
    }

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
    const { paymentElement, paymentMethod: token } = this.params;

    if (token) {
      return this._authorizePaymentMethod(token);
    }

    if (!(paymentElement ? this.stripeElements : this.stripeElement)) {
      throw new Error('Stripe payment element is not defined');
    }

    await this.loadScripts(this.scripts);

    const cart = await this.getCart();
    const paymentMethod = paymentElement
      ? await createCardPaymentMethodFromElements(
          this.stripe,
          this.stripeElements,
          cart,
        )
      : await createPaymentMethod(this.stripe, this.stripeElement, cart);

    if (paymentMethod.error) {
      throw new Error(paymentMethod.error.message);
    }

    if (!isLiveMode(this.method.mode)) {
      paymentMethod.test = true;
    }

    // should save payment method data when payment amount is not chargeable,
    // or when the host collects the card without authorizing it now
    if (
      !isStripeChargeableAmount(cart.capture_total, cart.currency) ||
      this.params.createIntent === false
    ) {
      await this.updateCart({
        billing: {
          method: 'card',
          card: paymentMethod,
        },
      });

      return this.onSuccess();
    }

    const intent = await this._authorizeIntent(cart, paymentMethod.token);

    await this.updateCart({
      billing: {
        method: 'card',
        card: paymentMethod,
        intent: { stripe: cartIntent(cart, intent) },
      },
    });

    this.onSuccess();
  }

  // A card the shopper already has (a saved card, a wallet's payment method) gets
  // the intent and 3-D Secure of a new one; other cards are authorized with the order
  async _authorizePaymentMethod(token) {
    const cart = await this.getCart();

    if (
      token.startsWith('pm_') &&
      isStripeChargeableAmount(cart.capture_total, cart.currency) &&
      this.params.createIntent !== false
    ) {
      await this.loadScripts(this.scripts);

      const intent = await this._authorizeIntent(cart, token);

      if (intent.id !== cart.billing?.intent?.stripe?.id) {
        await this.updateCart({
          billing: {
            method: 'card',
            intent: { stripe: cartIntent(cart, intent) },
          },
        });
      }
    }

    this.onSuccess();
  }

  // Reuses the cart's intent while Stripe still has it for this card and amount
  async _authorizeIntent(cart, token) {
    const exIntent = cart.billing?.intent?.stripe;
    const intent =
      (exIntent?.client_secret &&
        (await this._retrieveIntent(cart, exIntent, token))) ||
      (await this._createIntent(cart, token));

    switch (intent.status) {
      case 'requires_capture':
        break;

      case 'requires_confirmation':
        await this._confirmCardPayment(intent);
        break;

      case 'requires_action':
      case 'requires_source_action': {
        const actionResult = await this.stripe.handleCardAction(
          intent.client_secret,
        );

        if (actionResult.error) {
          throw new Error(actionResult.error.message);
        }

        break;
      }

      default:
        throw new Error(`Unsupported intent status: ${intent.status}`);
    }

    return intent;
  }

  async _retrieveIntent(cart, exIntent, token) {
    const { paymentIntent: intent, error } =
      await this.stripe.retrievePaymentIntent(exIntent.client_secret);

    const matches =
      !error &&
      intent.amount === intentAmount(cart) &&
      intent.currency === intentCurrency(cart) &&
      intent.payment_method === token &&
      !['canceled', 'requires_source', 'requires_payment_method'].includes(
        intent.status,
      );

    return matches ? intent : null;
  }

  async authenticate(payment) {
    const { transaction_id: id, card: { token } = {} } = payment;

    // The payment is re-queried whatever happens here: an intent the shopper
    // already confirmed can't be updated, and the payment must still learn it
    try {
      const intent = await this.updateIntent({
        gateway: 'stripe',
        intent: { id, payment_method: token },
      });

      if (intent.error) {
        throw new Error(intent.error.message);
      }

      await this.loadScripts(this.scripts);

      return await this._confirmCardPayment(intent);
    } finally {
      await this.resetAsyncPayment(payment.id);
    }
  }

  async _createIntent(cart, token) {
    const stripeCustomer = cart.account && cart.account.stripe_customer;
    const intent = await this.createIntent({
      gateway: 'stripe',
      intent: {
        amount: intentAmount(cart),
        currency: intentCurrency(cart),
        payment_method: token,
        capture_method: 'manual',
        setup_future_usage: 'off_session',
        ...(stripeCustomer ? { customer: stripeCustomer } : {}),
      },
    });

    if (!intent) {
      throw new Error('Stripe payment intent is not defined');
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
