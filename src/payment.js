const cartApi = require('./cart');
const settingsApi = require('./settings');
const { isFunction, vaultRequest } = require('./utils');

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
      const cart = await cartApi.methods(request).get();
      if (!cart) {
        throw new Error('Cart not found');
      }
      const payMethods = await settingsApi.methods(request).payments();
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      await render(request, cart, payMethods, this.params);
    },

    async tokenize() {
      const payMethods = await settingsApi.methods(request).payments();
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      return await paymentTokenize(request, this.params, payMethods);
    },

    async createIntent(data) {
      const intent = await vaultRequest('post', '/intent', data);
      if (intent.error) {
        throw new Error(intent.error);
      }
      return intent;
    },

    async updateIntent(data) {
      const intent = await vaultRequest('put', '/intent', data);
      if (intent.error) {
        throw new Error(intent.error);
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
  const { public_key: publicKey } = payMethods.card;
  const stripe = window.Stripe(publicKey);
  const elements = stripe.elements();
  const createElement = (type) => {
    const elementParams = params.card[type] || {};
    const elementOptions = elementParams.options || {};
    const element = elements.create(type, elementOptions);
    element.mount(elementParams.elementId || `#${type}-element`);
    if (type === 'card' || type === 'cardNumber') {
      CARD_ELEMENTS.stripe = element;
    }
  };
  API.stripe = stripe;

  if (params.card.separateElements) {
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

async function paymentTokenize(request, params, payMethods) {
  const onError = (error) => {
    if (isFunction(params.card.onError)) {
      return params.card.onError(error);
    }
    throw new Error(error.message);
  };

  if (!params) {
    return;
  }
  if (params.card && payMethods.card) {
    if (payMethods.card.gateway === 'stripe' && CARD_ELEMENTS.stripe && API.stripe) {
      const stripe = API.stripe;
      const stripeToken = await stripe
        .createToken(CARD_ELEMENTS.stripe)
        .then(({ token }) => token)
        .catch((error) => onError(error));

      if (stripeToken) {
        await cartApi
          .methods(request)
          .update({
            billing: {
              card: {
                token: stripeToken.id,
                last4: stripeToken.card.last4,
                exp_month: stripeToken.card.exp_month,
                exp_year: stripeToken.card.exp_year,
                brand: stripeToken.card.brand,
                address_check: stripeToken.card.address_line1_check,
                cvc_check: stripeToken.card.cvc_check,
                zip_check: stripeToken.card.address_zip_check,
              },
            },
          })
          .then(() => isFunction(params.card.onSuccess) && params.card.onSuccess())
          .catch((err) => onError(err));
      }
    }
  }
}

module.exports = {
  methods,
};
