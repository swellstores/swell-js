const get = require('lodash/get');
const toLower = require('lodash/toLower');
const cartApi = require('./cart');
const settingsApi = require('./settings');
const { isFunction, vaultRequest, toSnake } = require('./utils');
const {
  createPaymentMethod,
  createIDealPaymentMethod,
  createKlarnaSource,
  createBancontactSource,
  stripeAmountByCurrency,
} = require('./utils/stripe');

const LOADING_SCRIPTS = {};
const CARD_ELEMENTS = {};
const API = {};

function methods(request) {
  return {
    params: null,
    methodSettings: null,

    async methods() {
      if (this.methodSettings) {
        return this.methodSettings;
      }
      const result = await request('get', '/payment/methods');
      return (this.methodSettings = result);
    },

    async createElements(elementParams) {
      this.params = elementParams || {};
      const cart = toSnake(await cartApi.methods(request).get());
      if (!cart) {
        throw new Error('Cart not found');
      }
      const payMethods = toSnake(await settingsApi.methods(request).payments());
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      await render(request, cart, payMethods, this.params);
    },

    async tokenize(params) {
      const cart = toSnake(await cartApi.methods(request).get());
      if (!cart) {
        throw new Error('Cart not found');
      }
      const payMethods = toSnake(await settingsApi.methods(request).payments());
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      return await paymentTokenize(request, params || this.params, payMethods, cart);
    },

    async createIntent(data) {
      const intent = await vaultRequest('post', '/intent', data);
      if (intent.errors) {
        const param = Object.keys(intent.errors)[0];
        const err = new Error(intent.errors[param].message || 'Unknown error');
        err.code = 'vault_error';
        err.status = 402;
        err.param = param;
        throw err;
      }
      return intent;
    },

    async updateIntent(data) {
      const intent = await vaultRequest('put', '/intent', data);
      if (intent.errors) {
        const param = Object.keys(intent.errors)[0];
        const err = new Error(intent.errors[param].message || 'Unknown error');
        err.code = 'vault_error';
        err.status = 402;
        err.param = param;
        throw err;
      }
      return intent;
    },
  };
}

async function render(request, cart, payMethods, params) {
  if (params.card) {
    if (!payMethods.card) {
      console.error(
        `Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.`,
      );
    } else if (payMethods.card.gateway === 'braintree') {
      if (!window.braintree) {
        await loadScript(
          'braintree-web',
          'https://js.braintreegateway.com/web/3.57.0/js/client.min.js',
        );
      }
      // TODO: implement braintree elements
    } else if (payMethods.card.gateway === 'stripe') {
      if (!window.Stripe) {
        await loadScript('stripe-js', 'https://js.stripe.com/v3/');
      }
      await stripeElements(request, payMethods, params);
    }
  }
  if (params.ideal) {
    if (!payMethods.card) {
      console.error(
        `Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.`,
      );
    } else if (!payMethods.ideal) {
      console.error(
        `Payment element error: iDEAL payments are disabled. See Payment settings in the Swell dashboard for details.`,
      );
    } else if (payMethods.card.gateway === 'stripe') {
      if (!window.Stripe) {
        await loadScript('stripe-js', 'https://js.stripe.com/v3/');
      }
      await stripeElements(request, payMethods, params);
    }
  }
  if (params.paypal) {
    if (!payMethods.paypal) {
      console.error(
        `Payment element error: PayPal payments are disabled. See Payment settings in the Swell dashboard for details.`,
      );
    } else {
      if (!window.paypal) {
        await loadScript(
          'paypal-sdk',
          `https://www.paypal.com/sdk/js?client-id=${payMethods.paypal.client_id}&merchant-id=${payMethods.paypal.merchant_id}&vault=true`,
        );
      }
      if (
        payMethods.card &&
        payMethods.card.gateway === 'braintree' &&
        payMethods.paypal.gateway === 'braintree'
      ) {
        if (!window.braintree) {
          await loadScript(
            'braintree-web',
            'https://js.braintreegateway.com/web/3.57.0/js/client.min.js',
          );
        }
        if (window.braintree && !window.braintree.paypalCheckout) {
          await loadScript(
            'braintree-web-paypal-checkout',
            'https://js.braintreegateway.com/web/3.57.0/js/paypal-checkout.min.js',
          );
        }
        await braintreePayPalButton(request, cart, payMethods, params);
      }
    }
  }
}

const loadScript = async (id, src) => {
  LOADING_SCRIPTS[id] =
    LOADING_SCRIPTS[id] ||
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.type = 'text/javascript';
      script.addEventListener(
        'load',
        () => {
          resolve();
          LOADING_SCRIPTS[id] = null;
        },
        {
          once: true,
        },
      );
      document.head.appendChild(script);
    });
  return LOADING_SCRIPTS[id];
};

async function stripeElements(request, payMethods, params) {
  const { publishable_key } = payMethods.card;
  const stripe = window.Stripe(publishable_key);
  const elements = stripe.elements();
  const createElement = (type) => {
    const elementParams = get(params, `card[${type}]`) || params.card || params.ideal;
    const elementOptions = elementParams.options || {};
    const element = elements.create(type, elementOptions);
    element.mount(elementParams.elementId || `#${type}-element`);

    elementParams.onChange && element.on('change', elementParams.onChange);
    elementParams.onReady && element.on('ready', elementParams.onReady);
    elementParams.onFocus && element.on('focus', elementParams.onFocus);
    elementParams.onBlur && element.on('blur', elementParams.onBlur);
    elementParams.onEscape && element.on('escape', elementParams.onEscape);
    elementParams.onClick && element.on('click', elementParams.onClick);

    if (type === 'card' || type === 'cardNumber' || type === 'idealBank') {
      CARD_ELEMENTS.stripe = element;
    }
  };
  API.stripe = stripe;

  if (params.ideal) {
    createElement('idealBank');
  } else if (params.card.separateElements) {
    createElement('cardNumber');
    createElement('cardExpiry');
    createElement('cardCvc');
  } else {
    createElement('card');
  }
}

async function braintreePayPalButton(request, cart, payMethods, params) {
  const authorization = await vaultRequest('post', '/authorization', { gateway: 'braintree' });
  if (authorization.error) {
    throw new Error(authorization.error);
  }
  const braintree = window.braintree;
  const paypal = window.paypal;
  braintree.client
    .create({
      authorization,
    })
    .then((client) =>
      braintree.paypalCheckout.create({
        client,
      }),
    )
    .then((paypalCheckoutInstance) => {
      return paypal
        .Buttons({
          style: params.paypal.style || {},
          createBillingAgreement: () =>
            paypalCheckoutInstance.createPayment({
              flow: 'vault',
              currency: cart.currency,
              amount: cart.grand_total,
            }),
          onApprove: (data, actions) =>
            paypalCheckoutInstance
              .tokenizePayment(data)
              .then(({ nonce }) =>
                cartApi.methods(request).update({ billing: { paypal: { nonce } } }),
              )
              .then(
                () => isFunction(params.paypal.onSuccess) && params.paypal.onSuccess(data, actions),
              )
              .catch(
                isFunction(params.paypal.onError)
                  ? params.paypal.onError
                  : (err) => console.error('PayPal error', err),
              ),
          onCancel: isFunction(params.paypal.onCancel)
            ? () => params.paypal.onCancel()
            : () => console.log('PayPal payment cancelled'),
          onError: isFunction(params.paypal.onError)
            ? (err) => params.paypal.onError(err)
            : (err) => console.error('PayPal error', err),
        })
        .render(params.paypal.elementId || '#paypal-button');
    })
    .catch(
      isFunction(params.paypal.onError)
        ? params.paypal.onError
        : (err) => console.error('PayPal error', err),
    );
}

async function paymentTokenize(request, params, payMethods, cart) {
  const onError = (error) => {
    const errorHandler =
      get(params, 'card.onError') ||
      get(params, 'ideal.onError') ||
      get(params, 'klarna.onError') ||
      get(params, 'bancontact.onError');
    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }
    throw new Error(error.message);
  };

  if (!params) {
    return onError({ message: 'Tokenization parameters not passed' });
  }
  if (params.card && payMethods.card) {
    if (payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe) {
      const stripe = API.stripe;
      const paymentMethod = await createPaymentMethod(stripe, CARD_ELEMENTS.stripe, cart);

      if (paymentMethod.error) {
        return onError(paymentMethod.error);
      }

      const currency = toLower(get(cart, 'currency', 'usd'));
      const amount = stripeAmountByCurrency(currency, get(cart, 'grand_total', 0));
      const stripeCustomer = get(cart, 'account.stripe_customer');
      const intent = toSnake(
        await methods(request)
          .createIntent({
            gateway: 'stripe',
            intent: {
              payment_method: paymentMethod.token,
              amount,
              currency,
              capture_method: 'manual',
              setup_future_usage: 'off_session',
              ...(stripeCustomer ? { customer: stripeCustomer } : {}),
            },
          })
          .catch((err) => onError(err)),
      );

      if (intent && intent.status === 'requires_confirmation') {
        const { paymentIntent, error } = await stripe.confirmCardPayment(intent.client_secret);
        return error
          ? onError(error)
          : await cartApi
              .methods(request)
              .update({
                billing: {
                  method: 'card',
                  card: paymentMethod,
                  intent: {
                    stripe: { id: paymentIntent.id },
                  },
                },
              })
              .then(() => isFunction(params.card.onSuccess) && params.card.onSuccess())
              .catch((err) => onError(err));
      }
    }
  } else if (params.ideal && payMethods.ideal) {
    if (
      payMethods.card &&
      payMethods.card.gateway === 'stripe' &&
      CARD_ELEMENTS.stripe &&
      API.stripe
    ) {
      const { error, paymentMethod } = await createIDealPaymentMethod(
        API.stripe,
        CARD_ELEMENTS.stripe,
        cart.billing,
      );

      if (error) {
        return onError(error);
      }

      const currency = toLower(get(cart, 'currency', 'eur'));
      const amount = stripeAmountByCurrency(currency, get(cart, 'grand_total', 0));
      const intent = toSnake(
        await methods(request)
          .createIntent({
            gateway: 'stripe',
            intent: {
              payment_method: paymentMethod.id,
              amount,
              currency,
              payment_method_types: 'ideal',
              confirmation_method: 'manual',
              confirm: true,
              return_url: window.location.href,
            },
          })
          .catch((err) => onError(err)),
      );

      if (intent) {
        await cartApi
          .methods(request)
          .update({
            billing: {
              method: 'ideal',
              ideal: {
                token: paymentMethod.id,
              },
              intent: { stripe: { id: intent.id } },
            },
          })
          .catch((err) => onError(err));

        return (
          (intent.status === 'requires_action' || intent.status === 'requires_source_action') &&
          (await API.stripe.handleCardAction(intent.client_secret))
        );
      }
    }
  } else if (params.klarna && payMethods.klarna) {
    if (payMethods.card && payMethods.card.gateway === 'stripe') {
      if (!window.Stripe) {
        await loadScript('stripe-js', 'https://js.stripe.com/v3/');
      }
      const { publishable_key } = payMethods.card;
      const stripe = window.Stripe(publishable_key);
      const settings = toSnake(await settingsApi.methods(request).get());

      const { error, source } = await createKlarnaSource(stripe, {
        ...cart,
        settings: settings.store,
      });

      return error
        ? onError(error)
        : cartApi
            .methods(request)
            .update({
              billing: {
                method: 'klarna',
              },
            })
            .then(() => window.location.replace(source.redirect.url))
            .catch((err) => onError(err));
    }
  } else if (params.bancontact && payMethods.bancontact) {
    if (payMethods.card && payMethods.card.gateway === 'stripe') {
      if (!window.Stripe) {
        await loadScript('stripe-js', 'https://js.stripe.com/v3/');
      }
      const { publishable_key } = payMethods.card;
      const stripe = window.Stripe(publishable_key);

      const { error, source } = await createBancontactSource(stripe, cart);

      return error
        ? onError(error)
        : cartApi
            .methods(request)
            .update({
              billing: {
                method: 'bancontact',
              },
            })
            .then(() => window.location.replace(source.redirect.url))
            .catch((err) => onError(err));
    }
  }
}

module.exports = {
  methods,
};
