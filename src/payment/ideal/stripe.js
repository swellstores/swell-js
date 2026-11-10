import Payment from '../payment';
import {
  createElement,
  createIDealPaymentMethod,
  createPaymentElements,
  createPaymentMethodFromElements,
  getIDealElementsOptions,
  stripeAmountByCurrency,
} from '../../utils/stripe';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
  UnableAuthenticatePaymentMethodError,
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

  /** @returns {import('@stripe/stripe-js').StripeElements} */
  get stripeElements() {
    return StripeIDealPayment.stripeElements;
  }

  /** @param {import('@stripe/stripe-js').StripeElements} stripeElements */
  set stripeElements(stripeElements) {
    StripeIDealPayment.stripeElements = stripeElements;
  }

  /** @param {import('../../../types').Cart} cart */
  async createElements(cart) {
    await this.loadScripts(this.scripts);

    if (this.params.paymentElement) {
      this.stripeElements = createPaymentElements(
        this.stripe,
        getIDealElementsOptions(cart),
        this.params,
      );

      return;
    }

    const elements = this.stripe.elements(this.params.config);

    this.stripeElement = createElement('idealBank', elements, this.params);
  }

  async tokenize() {
    const { paymentElement } = this.params;

    if (!(paymentElement ? this.stripeElements : this.stripeElement)) {
      throw new Error('Stripe payment element is not defined');
    }

    await this.loadScripts(this.scripts);

    const cart = await this.getCart();
    const { paymentMethod, error: paymentMethodError } = paymentElement
      ? await createPaymentMethodFromElements(
          this.stripe,
          this.stripeElements,
          getIDealElementsOptions(cart),
          cart,
        )
      : await createIDealPaymentMethod(this.stripe, this.stripeElement, cart);

    if (paymentMethodError) {
      throw new Error(paymentMethodError.message);
    }

    const intent = await this._createIntent(cart, paymentMethod);

    await this.stripe.handleCardAction(intent.client_secret);
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

    if (
      !['succeeded', 'requires_capture', 'processing'].includes(
        paymentIntent.status,
      )
    ) {
      throw new Error(
        paymentIntent.last_payment_error?.message ||
          `Unsupported intent status (${paymentIntent.status})`,
      );
    }

    // the cart's billing was written in `tokenize`
    this.onSuccess();
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
        // `gateway` lets `handleRedirect` run on return; Stripe appends the intent and `redirect_status`
        return_url: getReturnUrl(),
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

function getReturnUrl() {
  const url = new URL(window.location.href);

  url.searchParams.set('gateway', 'stripe');

  return url.toString();
}
