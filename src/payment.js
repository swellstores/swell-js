import get from 'lodash-es/get';
import toLower from 'lodash-es/toLower';
import cartApi from './cart';
import settingsApi from './settings';
import {
  isFunction,
  vaultRequest,
  toSnake,
  getLocationParams,
  removeUrlParams,
} from './utils';
import {
  createPaymentMethod,
  createIDealPaymentMethod,
  createKlarnaSource,
  createBancontactSource,
  stripeAmountByCurrency,
} from './utils/stripe';
import {
  createQuickpayPayment,
  createQuickpayCard,
  getQuickpayCardDetais,
} from './utils/quickpay';
import { createPaysafecardPayment } from './utils/paysafecard';
import { createKlarnaSession } from './utils/klarna';

const LOADING_SCRIPTS = {};
const CARD_ELEMENTS = {};
const API = {};

let options = null;

function methods(request, opts) {
  options = opts || options;

  return {
    params: null,
    methodSettings: null,

    get(id) {
      return request('get', '/payments', id);
    },

    async methods() {
      if (this.methodSettings) {
        return this.methodSettings;
      }
      const result = await request('get', '/payment/methods');
      return (this.methodSettings = result);
    },

    async createElements(elementParams) {
      this.params = elementParams || {};
      const cart = toSnake(await cartApi(request, options).get());
      if (!cart) {
        throw new Error('Cart not found');
      }
      const payMethods = toSnake(
        await settingsApi(request, options).payments(),
      );
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      await render(request, cart, payMethods, this.params);
    },

    async tokenize(params) {
      const cart = toSnake(await cartApi(request, options).get());
      if (!cart) {
        throw new Error('Cart not found');
      }
      const payMethods = toSnake(
        await settingsApi(request, options).payments(),
      );
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      return await paymentTokenize(
        request,
        params || this.params,
        payMethods,
        cart,
      );
    },

    async handleRedirect(params) {
      const cart = toSnake(await cartApi(request, options).get());
      if (!cart) {
        throw new Error('Cart not found');
      }
      return await handleRedirect(request, params || this.params, cart);
    },

    async authenticate(id) {
      const payment = await this.get(id);
      if (!payment) {
        throw new Error('Payment not found');
      }
      const payMethods = toSnake(
        await settingsApi(request, options).payments(),
      );
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      return await authenticate(request, payment, payMethods);
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

    async authorizeGateway(data) {
      const authorization = await vaultRequest('post', '/authorization', data);
      if (authorization.errors) {
        const param = Object.keys(authorization.errors)[0];
        const err = new Error(
          authorization.errors[param].message || 'Unknown error',
        );
        err.code = 'vault_error';
        err.status = 402;
        err.param = param;
        throw err;
      }
      return authorization;
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
    } else if (
      payMethods.card &&
      payMethods.card.gateway === 'braintree' &&
      payMethods.paypal.gateway === 'braintree'
    ) {
      if (!window.paypal) {
        await loadScript(
          'paypal-sdk',
          `https://www.paypal.com/sdk/js?currency=${cart.currency}&client-id=${payMethods.paypal.client_id}&merchant-id=${payMethods.paypal.merchant_id}&vault=true`,
        );
      }
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
    } else {
      if (!window.paypal) {
        await loadScript(
          'paypal-sdk',
          `https://www.paypal.com/sdk/js?currency=${cart.currency}&client-id=${payMethods.paypal.client_id}&merchant-id=${payMethods.paypal.merchant_id}&intent=authorize&commit=false`,
        );
      }
      await payPalButton(request, cart, payMethods, params);
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
  const elements = stripe.elements(params.config);
  const createElement = (type) => {
    const elementParams =
      get(params, `card[${type}]`) || params.card || params.ideal;
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

/**
 * Update cart email with paypal's when no email is present
 */
export async function shouldUsePayPalEmail(guest, request, options) {
  // Only check if the email should be updated when the user is not logged in (guest user)
  if (!guest) return false;

  // Refetch to avoid stale data from the cart
  const updatedCart = await cartApi(request, options).get();
  const currentEmail = get(updatedCart, 'account.email');

  // If no email is present, use paypal's email
  if (!currentEmail) {
    return true;
  } else {
    return false;
  }
}

async function payPalButton(request, cart, payMethods, params) {
  const paypal = window.paypal;
  const { paypal: { locale, style, elementId } = {} } = params;
  const { capture_total, currency, guest } = cart;

  const onError = (error) => {
    const errorHandler = get(params, 'paypal.onError');
    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }
    throw new Error(error.message);
  };
  const onSuccess = () => {
    const successHandler = get(params, 'paypal.onSuccess');
    return isFunction(successHandler) && successHandler();
  };

  if (!(capture_total > 0)) {
    throw new Error(
      'Invalid PayPal button amount. Value should be greater than zero.',
    );
  }

  paypal
    .Buttons(
      {
        locale: locale || 'en_US',
        style: style || {
          layout: 'horizontal',
          height: 45,
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          tagline: false,
        },
        createOrder: (data, actions) =>
          actions.order.create({
            intent: 'AUTHORIZE',
            purchase_units: [
              {
                amount: {
                  value: +capture_total.toFixed(2),
                  currency_code: currency,
                },
              },
            ],
          }),
        onApprove: (data, actions) =>
          actions.order
            .get()
            .then(async (order) => {
              const orderId = order.id;
              const payer = order.payer;
              const shipping = get(order, 'purchase_units[0].shipping');

              const usePayPalEmail = await shouldUsePayPalEmail(
                guest,
                request,
                options,
              );

              return cartApi(request).update({
                ...(usePayPalEmail && {
                  account: {
                    email: payer.email_address,
                  },
                }),
                billing: {
                  method: 'paypal',
                  paypal: { order_id: orderId },
                },
                shipping: {
                  name: shipping.name.full_name,
                  address1: shipping.address.address_line_1,
                  address2: shipping.address.address_line_2,
                  state: shipping.address.admin_area_1,
                  city: shipping.address.admin_area_2,
                  zip: shipping.address.postal_code,
                  country: shipping.address.country_code,
                },
              });
            })
            .then(onSuccess)
            .catch(onError),
      },
      onError,
    )
    .render(elementId || '#paypal-button');
}

async function braintreePayPalButton(request, cart, payMethods, params) {
  const authorization = await vaultRequest('post', '/authorization', {
    gateway: 'braintree',
  });
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
                cartApi(request, options).update({
                  billing: { paypal: { nonce } },
                }),
              )
              .then(
                () =>
                  isFunction(params.paypal.onSuccess) &&
                  params.paypal.onSuccess(data, actions),
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
  const { capture_total, auth_total } = cart;
  const onError = (error) => {
    const errorHandler =
      get(params, 'card.onError') ||
      get(params, 'ideal.onError') ||
      get(params, 'klarna.onError') ||
      get(params, 'bancontact.onError') ||
      get(params, 'paysafecard.onError');
    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }
    throw new Error(error.message);
  };
  const onSuccess = (result) => {
    const successHandler =
      get(params, 'card.onSuccess') || get(params, 'ideal.onSuccess');
    if (isFunction(successHandler)) {
      return successHandler(result);
    }
  };

  if (!params) {
    return onError({ message: 'Tokenization parameters not passed' });
  }
  if (params.card && payMethods.card) {
    if (
      payMethods.card.gateway === 'stripe' &&
      CARD_ELEMENTS.stripe &&
      API.stripe
    ) {
      const stripe = API.stripe;
      const paymentMethod = await createPaymentMethod(
        stripe,
        CARD_ELEMENTS.stripe,
        cart,
      ).catch(onError);

      if (!paymentMethod) {
        return;
      } else if (paymentMethod.error) {
        return onError(paymentMethod.error);
      } else if (capture_total < 1) {
        // should save payment method data when payment amount is less than 1
        // https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
        return cartApi(request, options)
          .update({
            billing: {
              method: 'card',
              card: paymentMethod,
            },
          })
          .then(onSuccess)
          .catch(onError);
      }

      const currency = toLower(get(cart, 'currency', 'usd'));
      const amount = stripeAmountByCurrency(
        currency,
        capture_total + auth_total,
      );
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
          .catch(onError),
      );

      if (
        intent &&
        ['requires_capture', 'requires_confirmation'].includes(intent.status)
      ) {
        if (intent.status === 'requires_confirmation') {
          // Confirm the payment intent
          const { error } = await stripe.confirmCardPayment(
            intent.client_secret,
          );
          if (error) {
            return onError(error);
          }
        }

        // Capture the payment
        return await cartApi(request, options)
          .update({
            billing: {
              method: 'card',
              card: paymentMethod,
              intent: {
                stripe: {
                  id: intent.id,
                  ...(!!auth_total && {
                    auth_amount: auth_total,
                  }),
                },
              },
            },
          })
          .then(onSuccess)
          .catch(onError);
      }
    } else if (payMethods.card.gateway === 'quickpay') {
      const intent = await createQuickpayPayment(
        cart,
        methods(request).createIntent,
      ).catch(onError);
      if (!intent) {
        return;
      } else if (intent.error) {
        return onError(intent.error);
      }

      await cartApi(request, options).update({
        billing: {
          method: 'card',
          intent: {
            quickpay: {
              id: intent,
            },
          },
        },
      });

      createQuickpayCard(methods(request).authorizeGateway).catch(onError);
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
        cart,
      );

      if (error) {
        return onError(error);
      }

      const currency = toLower(get(cart, 'currency', 'eur'));
      const amount = stripeAmountByCurrency(currency, capture_total);
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
          .catch(onError),
      );

      if (intent) {
        await cartApi(request, options)
          .update({
            billing: {
              method: 'ideal',
              ideal: {
                token: paymentMethod.id,
              },
              intent: { stripe: { id: intent.id } },
            },
          })
          .catch(onError);

        return (
          (intent.status === 'requires_action' ||
            intent.status === 'requires_source_action') &&
          (await API.stripe.handleCardAction(intent.client_secret))
        );
      }
    }
  } else if (params.klarna && payMethods.klarna) {
    if (payMethods.klarna.gateway === 'klarna') {
      const session = await createKlarnaSession(
        cart,
        methods(request).createIntent,
      ).catch(onError);
      return session && window.location.replace(session.redirect_url);
    } else if (payMethods.card && payMethods.card.gateway === 'stripe') {
      if (!window.Stripe) {
        await loadScript('stripe-js', 'https://js.stripe.com/v3/');
      }
      const { publishable_key } = payMethods.card;
      const stripe = window.Stripe(publishable_key);
      const settings = toSnake(await settingsApi(request, options).get());

      const { error, source } = await createKlarnaSource(stripe, {
        ...cart,
        settings: settings.store,
      });

      return error
        ? onError(error)
        : cartApi(request, options)
            .update({
              billing: {
                method: 'klarna',
              },
            })
            .then(() => window.location.replace(source.redirect.url))
            .catch(onError);
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
        : cartApi(request, options)
            .update({
              billing: {
                method: 'bancontact',
              },
            })
            .then(() => window.location.replace(source.redirect.url))
            .catch(onError);
    }
  } else if (params.paysafecard && payMethods.paysafecard) {
    const intent = await createPaysafecardPayment(
      cart,
      methods(request).createIntent,
    ).catch(onError);
    if (!intent) {
      return;
    }

    await cartApi(request, options).update({
      billing: {
        method: 'paysafecard',
        intent: {
          paysafecard: {
            id: intent.id,
          },
        },
      },
    });

    return window.location.replace(intent.redirect.auth_url);
  }
}

async function handleRedirect(request, params, cart) {
  const onError = (error) => {
    const errorHandler =
      get(params, 'card.onError') ||
      get(params, 'paysafecard.onError') ||
      get(params, 'klarna.onError');
    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }
    throw new Error(error.message);
  };
  const onSuccess = (result) => {
    const successHandler =
      get(params, 'card.onSuccess') ||
      get(params, 'paysafecard.onSuccess') ||
      get(params, 'klarna.onSuccess');
    if (isFunction(successHandler)) {
      return successHandler(result);
    }
  };

  const queryParams = getLocationParams(window.location);
  removeUrlParams();
  const { gateway } = queryParams;
  let result;
  if (gateway === 'quickpay') {
    result = await handleQuickpayRedirectAction(
      request,
      cart,
      params,
      queryParams,
    );
  } else if (gateway === 'paysafecard') {
    result = await handlePaysafecardRedirectAction(
      request,
      cart,
      params,
      queryParams,
    );
  } else if (gateway === 'klarna_direct') {
    result = await handleDirectKlarnaRedirectAction(
      request,
      cart,
      params,
      queryParams,
    );
  }

  if (!result) {
    return;
  } else if (result.error) {
    return onError(result.error);
  } else {
    return onSuccess(result);
  }
}

async function handleQuickpayRedirectAction(
  request,
  cart,
  params,
  queryParams,
) {
  const { redirect_status: status, card_id: id } = queryParams;

  switch (status) {
    case 'succeeded':
      const card = await getQuickpayCardDetais(
        id,
        methods(request).authorizeGateway,
      );
      if (!card) {
        return;
      } else if (card.error) {
        return card;
      } else {
        await cartApi(request, options).update({
          billing: {
            method: 'card',
            card,
          },
        });
        return { success: true };
      }
    case 'canceled':
      return {
        error: {
          message:
            'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
        },
      };
    default:
      return { error: { message: `Unknown redirect status: ${status}.` } };
  }
}

async function handlePaysafecardRedirectAction(request, cart) {
  const paymentId = get(cart, 'billing.intent.paysafecard.id');
  if (!paymentId) {
    return {
      error: {
        message: 'Paysafecard payment ID not defined.',
      },
    };
  }

  const intent = await methods(request).updateIntent({
    gateway: 'paysafecard',
    intent: { payment_id: paymentId },
  });

  if (!intent) {
    return;
  }
  switch (intent.status) {
    case 'AUTHORIZED':
      return { success: true };
    case 'CANCELED_CUSTOMER':
      return {
        error: {
          message:
            'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
        },
      };
    default:
      return {
        error: { message: `Unknown redirect status: ${intent.status}.` },
      };
  }
}

async function handleDirectKlarnaRedirectAction(
  request,
  cart,
  params,
  queryParams,
) {
  const { authorization_token } = queryParams;

  if (!authorization_token) {
    return {
      error: {
        message:
          'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
      },
    };
  }

  await cartApi(request, options).update({
    billing: {
      method: 'klarna',
      klarna: {
        token: authorization_token,
      },
    },
  });
  return { success: true };
}

async function authenticate(request, payment, payMethods) {
  const { method, gateway } = payment;
  if (method === 'card') {
    const cardMethod = payMethods.card;
    if (!cardMethod) {
      console.error(
        `Authenticate error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.`,
      );
    } else if (gateway === 'stripe' && cardMethod.gateway === 'stripe') {
      if (!window.Stripe) {
        await loadScript('stripe-js', 'https://js.stripe.com/v3/');
      }
      return authenticateStripeCard(request, payment, payMethods);
    }
  }
}

async function authenticateStripeCard(request, payment, payMethods) {
  const { transaction_id: id, card: { token } = {} } = payment;
  const { publishable_key } = payMethods.card;
  const intent = await methods(request, options)
    .updateIntent({
      gateway: 'stripe',
      intent: { id, payment_method: token },
    })
    .catch((error) => ({
      error,
    }));
  if (intent.error) {
    return intent;
  }
  const stripe = window.Stripe(publishable_key);
  const actionResult = await stripe.confirmCardPayment(intent.client_secret);
  return actionResult.error
    ? {
        error: {
          message: actionResult.error.message,
          code: actionResult.error.code,
        },
      }
    : { status: actionResult.status };
}

export default methods;
