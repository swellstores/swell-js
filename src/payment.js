const cartApi = require('./cart');
const cardApi = require('./card');
const settingsApi = require('./settings');
const { isFunction, vaultRequest } = require('./utils');

const LOADING_SCRIPTS = {};

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
      return await paymentTokenize(this.params, payMethods);
    },
  };
}

async function render(request, cart, payMethods, params) {
  if (params.card) {
    if (!payMethods.card) {
      console.error(`Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.`);
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
      console.error(`Payment element error: PayPal payments are disabled. See Payment settings in the Swell dashboard for details.`);
    } else {
      if (!window.paypal) {
        await loadScript(
          'paypal-sdk',
          `https://www.paypal.com/sdk/js?client-id=${payMethods.paypal.client_id}&merchant-id=${payMethods.paypal.merchant_id}&vault=true`,
        );
      }
      if (payMethods.card && payMethods.card.gateway === 'braintree') {
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
  const onError = (error) => {
    if (isFunction(params.onError)) {
      return params.onError(error);
    }
    throw new Error(error.message);
  };

  const { public_key: publicKey } = payMethods.card;
  const stripe = window.Stripe(publicKey);
  const elements = stripe.elements();
  let card = null;
  const createElement = (type) => {
    const elementParams = params.card[type] || {};
    const elementOptions = elementParams.options || {};
    const element = elements.create(type, elementOptions);
    element.mount(elementParams.elementId || `#${type}-element`);
    if (type === 'card' || type === 'cardNumber') {
      card = element;
    }
  };

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
              .then(() => isFunction(params.onSuccess) && params.onSuccess())
              .catch(
                isFunction(params.onError)
                  ? params.onError
                  : (err) => console.error('PayPal error', err),
              ),
          onCancel: isFunction(params.onCancel)
            ? () => params.onCancel()
            : () => console.log('PayPal payment cancelled'),
          onError: isFunction(params.onError)
            ? (err) => params.onError(err)
            : (err) => console.error('PayPal error', err),
        })
        .render(params.paypal.elementId || '#paypal-button');
    })
    .catch(
      isFunction(params.onError) ? params.onError : (err) => console.error('PayPal error', err),
    );
}

async function paymentTokenize(params, payMethods) {
  if (!params) {
    return;
  }
  if (params.card && payMethods.card) {
    if (payMethods.card.gateway === 'stripe') {
      const stripeToken = await stripe
        .createToken(card)
        .then(({ token, error }) => (error ? onError(error) : token));

      const cardData = {
        nonce: token.id,
        last4: token.card.last4,
        exp_month: token.card.exp_month,
        exp_year: token.card.exp_year,
        brand: token.card.brand,
        address_check: token.card.address_line1_check,
        cvc_check: token.card.cvc_check,
        zip_check: token.card.address_zip_check,
      };

      await cardApi
        .createToken(cardData)
        .then(async ({ token }) => {
          await cartApi.methods(request).update({ billing: { card: { token } } });
          if (isFunction(params.onSuccess)) {
            params.onSuccess({ ...cardData, token, stripe_token: stripeToken.id });
          }
        })
        .catch((err) => onError(err));
    }
  }
}

module.exports = {
  methods,
};
