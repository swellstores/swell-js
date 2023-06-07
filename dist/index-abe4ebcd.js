import { m as methods } from './cart-ff3e3ef6.js';
import { m as methods$1 } from './settings-c5569614.js';
import { v as isFunction, w as isObject, I as loadScript, b as cloneDeep, g as get, j as toSnake, F as vaultRequest, p as pick, y as toLower, A as isEmpty, D as reduce, J as isLiveMode, C as map, x as toNumber, G as getLocationParams, H as removeUrlParams, t as toCamel } from './index-512fc30d.js';
import 'qs';
import 'deepmerge';
import 'fast-case';

const SCRIPT_HANDLERS = {
  'stripe-js': loadStripe,
  'paypal-sdk': loadPaypal,
  'google-pay': loadGoogle,
  'braintree-web': loadBraintree,
  'braintree-paypal-sdk': loadBraintreePaypal,
  'braintree-web-paypal-checkout': loadBraintreePaypalCheckout,
  'braintree-google-payment': loadBraintreeGoogle,
  'braintree-apple-payment': loadBraintreeApple,
  'amazon-checkout': loadAmazonCheckout,
};

async function loadStripe() {
  if (!window.Stripe || window.Stripe.version !== 3) {
    await loadScript('stripe-js', 'https://js.stripe.com/v3/');
  }

  if (!window.Stripe) {
    console.error('Warning: Stripe was not loaded');
  }

  if (window.Stripe.StripeV3) {
    window.Stripe = window.Stripe.StripeV3;
  }

  if (window.Stripe.version !== 3) {
    console.error('Warning: Stripe V3 was not loaded');
  }
}

async function loadPaypal(params) {
  if (!window.paypal) {
    await loadScript(
      'paypal-sdk',
      `https://www.paypal.com/sdk/js?currency=${params.currency}&client-id=${params.client_id}&merchant-id=${params.merchant_id}&intent=authorize&commit=false`,
      {
        'data-partner-attribution-id': 'SwellCommerce_SP',
      },
    );
  }

  if (!window.paypal) {
    console.error('Warning: PayPal was not loaded');
  }
}

async function loadGoogle() {
  if (!window.google) {
    await loadScript('google-pay', 'https://pay.google.com/gp/p/js/pay.js');
  }

  if (!window.google) {
    console.error('Warning: Google was not loaded');
  }
}

async function loadBraintree() {
  if (!window.braintree) {
    await loadScript(
      'braintree-web',
      'https://js.braintreegateway.com/web/3.73.1/js/client.min.js',
    );
  }

  if (!window.braintree) {
    console.error('Warning: Braintree was not loaded');
  }
}

async function loadBraintreePaypal(params) {
  if (!window.paypal) {
    await loadScript(
      'braintree-paypal-sdk',
      `https://www.paypal.com/sdk/js?client-id=${params.client_id}&merchant-id=${params.merchant_id}&vault=true`,
    );
  }

  if (!window.paypal) {
    console.error('Warning: Braintree PayPal was not loaded');
  }
}

async function loadBraintreePaypalCheckout() {
  if (window.braintree && !window.braintree.paypalCheckout) {
    await loadScript(
      'braintree-web-paypal-checkout',
      'https://js.braintreegateway.com/web/3.73.1/js/paypal-checkout.min.js',
    );
  }

  if (window.braintree && !window.braintree.paypalCheckout) {
    console.error('Warning: Braintree PayPal Checkout was not loaded');
  }
}

async function loadBraintreeGoogle() {
  if (window.braintree && !window.braintree.googlePayment) {
    await loadScript(
      'braintree-google-payment',
      'https://js.braintreegateway.com/web/3.73.1/js/google-payment.min.js',
    );
  }

  if (window.braintree && !window.braintree.googlePayment) {
    console.error('Warning: Braintree Google Payment was not loaded');
  }
}

async function loadBraintreeApple() {
  if (window.braintree && !window.braintree.applePay) {
    await loadScript(
      'braintree-apple-payment',
      'https://js.braintreegateway.com/web/3.73.1/js/apple-pay.min.js',
    );
  }

  if (window.braintree && !window.braintree.applePay) {
    console.error('Warning: Braintree Apple Payment was not loaded');
  }
}

async function loadAmazonCheckout() {
  if (!window.amazon) {
    await loadScript(
      'amazon-checkout',
      'https://static-na.payments-amazon.com/checkout.js',
    );
  }

  if (!window.amazon) {
    console.error('Warning: Amazon Checkout was not loaded');
  }
}

async function loadScripts(scripts) {
  if (!scripts) {
    return;
  }

  for (const script of scripts) {
    let scriptId = script;
    let scriptParams;

    if (isObject(script)) {
      scriptId = script.id;
      scriptParams = script.params;
    }

    const scriptHandler = SCRIPT_HANDLERS[scriptId];

    if (!isFunction(scriptHandler)) {
      console.error(`Unknown script ID: ${scriptId}`);
      continue;
    }

    await scriptHandler(scriptParams);
  }

  // Wait until the scripts are fully loaded.
  // Some scripts don't work correctly in Safari without this.
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

class Payment {
  constructor(request, options, params, method) {
    this.request = request;
    this.options = options;
    this.params = params;
    this.method = method;
  }

  async loadScripts(scripts) {
    await this._populateScriptsParams(scripts);
    await loadScripts(scripts);
  }

  async getCart() {
    const cart = await methods(this.request, this.options).get();

    if (!cart) {
      throw new Error('Cart not found');
    }

    return this._adjustCart(cart);
  }

  async updateCart(data) {
    const updateData = cloneDeep(data);

    // account data should only be updated when the user is a guest and no email is present
    if (data.account) {
      const cart = await this.getCart();
      const shouldUpdateAccount = cart.guest && !get(cart, 'account.email');

      if (!shouldUpdateAccount) {
        delete updateData.account;
      }
    }

    const updatedCart = await methods(this.request, this.options).update(
      updateData,
    );

    return this._adjustCart(updatedCart);
  }

  async getSettings() {
    return methods$1(this.request, this.options).get();
  }

  async createIntent(data) {
    return this._vaultRequest('post', '/intent', data);
  }

  async updateIntent(data) {
    return this._vaultRequest('put', '/intent', data);
  }

  async authorizeGateway(data) {
    return this._vaultRequest('post', '/authorization', data);
  }

  onSuccess(data) {
    const successHandler = get(this.params, 'onSuccess');

    if (isFunction(successHandler)) {
      return successHandler(data);
    }
  }

  onCancel() {
    const cancelHandler = get(this.params, 'onCancel');

    if (isFunction(cancelHandler)) {
      return cancelHandler();
    }
  }

  onError(error) {
    const errorHandler = get(this.params, 'onError');

    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }

    console.error(error.message);
  }

  async _adjustCart(cart) {
    return this._ensureCartSettings(cart).then(toSnake);
  }

  async _ensureCartSettings(cart) {
    if (cart.settings) {
      return cart;
    }

    const settings = await this.getSettings();

    return { ...cart, settings: { ...settings.store } };
  }

  async _vaultRequest(method, url, data) {
    const response = await vaultRequest(method, url, data);

    if (response.errors) {
      const param = Object.keys(response.errors)[0];
      const err = new Error(response.errors[param].message || 'Unknown error');
      err.code = 'vault_error';
      err.status = 402;
      err.param = param;
      throw err;
    }

    return response;
  }

  async _populateScriptsParams(scripts = []) {
    for (const script of scripts) {
      await this._populateScriptWithCartParams(script);
    }
  }

  async _populateScriptWithCartParams(script) {
    const cartParams = get(script, 'params.cart');

    if (!cartParams) {
      return;
    }

    const cart = await this.getCart();

    script.params = {
      ...script.params,
      ...pick(cart, cartParams),
    };

    delete script.params.cart;
  }
}

// https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
const MINIMUM_CHARGE_AMOUNT = {
  USD: 0.5,
  AED: 2,
  AUD: 0.5,
  BGN: 1,
  BRL: 0.5,
  CAD: 0.5,
  CHF: 0.5,
  CZK: 15,
  DKK: 2.5,
  EUR: 0.5,
  GBP: 0.3,
  HKD: 4,
  HRK: 0.5,
  HUF: 175,
  INR: 0.5,
  JPY: 50,
  MXN: 10,
  MYR: 2,
  NOK: 3,
  NZD: 0.5,
  PLN: 2,
  RON: 2,
  SEK: 3,
  SGD: 0.5,
  THB: 10,
};

const addressFieldsMap$1 = {
  city: 'city',
  country: 'country',
  line1: 'address1',
  line2: 'address2',
  postal_code: 'zip',
  state: 'state',
};

const billingFieldsMap = {
  name: 'name',
  phone: 'phone',
};

function mapValues(fieldsMap, data) {
  const result = {};
  for (const [destinationKey, sourceKey] of Object.entries(fieldsMap)) {
    const value = data[sourceKey];
    if (value) {
      result[destinationKey] = value;
    }
  }
  return result;
}

function getBillingDetails(cart) {
  const details = {
    ...mapValues(billingFieldsMap, cart.billing),
  };

  if (cart.account && cart.account.email) {
    details.email = cart.account.email;
  }

  const address = mapValues(addressFieldsMap$1, cart.billing);
  if (!isEmpty(address)) {
    details.address = address;
  }

  return details;
}

function setBancontactOwner(source, data) {
  const fillValues = (fieldsMap, data) =>
    reduce(
      fieldsMap,
      (acc, srcKey, destKey) => {
        const value = data[srcKey];
        if (value) {
          acc[destKey] = value;
        }
        return acc;
      },
      {},
    );
  const { account = {}, billing, shipping } = data;
  const billingData = {
    ...account.shipping,
    ...account.billing,
    ...shipping,
    ...billing,
  };
  const billingAddress = fillValues(addressFieldsMap$1, billingData);

  source.owner = {
    email: account.email,
    name: billingData.name || account.name,
    ...(billingData.phone
      ? { phone: billingData.phone }
      : account.phone
      ? { phone: account.phone }
      : {}),
    ...(!isEmpty(billingAddress) ? { address: billingAddress } : {}),
  };
}

function createElement(type, elements, params) {
  const elementParams = params[type] || params;
  const elementOptions = elementParams.options || {};
  const element = elements.create(type, elementOptions);

  elementParams.onChange && element.on('change', elementParams.onChange);
  elementParams.onReady && element.on('ready', elementParams.onReady);
  elementParams.onFocus && element.on('focus', elementParams.onFocus);
  elementParams.onBlur && element.on('blur', elementParams.onBlur);
  elementParams.onEscape && element.on('escape', elementParams.onEscape);
  elementParams.onClick && element.on('click', elementParams.onClick);

  element.mount(elementParams.elementId || `#${type}-element`);

  return element;
}

async function createPaymentMethod(stripe, cardElement, cart) {
  const billingDetails = getBillingDetails(cart);
  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: billingDetails,
  });

  return error
    ? { error }
    : {
        token: paymentMethod.id,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        brand: paymentMethod.card.brand,
        address_check: paymentMethod.card.checks.address_line1_check,
        cvc_check: paymentMethod.card.checks.cvc_check,
        zip_check: paymentMethod.card.checks.address_zip_check,
      };
}

async function createIDealPaymentMethod(stripe, element, cart) {
  const billingDetails = getBillingDetails(cart);
  return await stripe.createPaymentMethod({
    type: 'ideal',
    ideal: element,
    ...(billingDetails ? { billing_details: billingDetails } : {}),
  });
}

function getKlarnaIntentDetails(cart) {
  const { account, currency, capture_total } = cart;
  const stripeCustomer = account && account.stripe_customer;
  const stripeCurrency = (currency || 'USD').toLowerCase();
  const stripeAmount = stripeAmountByCurrency(currency, capture_total);
  const details = {
    payment_method_types: 'klarna',
    amount: stripeAmount,
    currency: stripeCurrency,
    capture_method: 'manual',
  };

  if (stripeCustomer) {
    details.customer = stripeCustomer;
  }

  return details;
}

function getKlarnaConfirmationDetails(cart) {
  const billingDetails = getBillingDetails(cart);
  const returnUrl = `${
    window.location.origin + window.location.pathname
  }?gateway=stripe`;

  return {
    payment_method: {
      billing_details: billingDetails,
    },
    return_url: returnUrl,
  };
}

async function createBancontactSource(stripe, cart) {
  const sourceObject = {
    type: 'bancontact',
    amount: Math.round(get(cart, 'grand_total', 0) * 100),
    currency: toLower(get(cart, 'currency', 'eur')),
    redirect: {
      return_url: window.location.href,
    },
  };
  setBancontactOwner(sourceObject, cart);

  return await stripe.createSource(sourceObject);
}

function stripeAmountByCurrency(currency, amount) {
  const zeroDecimalCurrencies = [
    'BIF', // Burundian Franc
    'DJF', // Djiboutian Franc,
    'JPY', // Japanese Yen
    'KRW', // South Korean Won
    'PYG', // Paraguayan Guaraní
    'VND', // Vietnamese Đồng
    'XAF', // Central African Cfa Franc
    'XPF', // Cfp Franc
    'CLP', // Chilean Peso
    'GNF', // Guinean Franc
    'KMF', // Comorian Franc
    'MGA', // Malagasy Ariary
    'RWF', // Rwandan Franc
    'VUV', // Vanuatu Vatu
    'XOF', // West African Cfa Franc
  ];
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return amount;
  } else {
    return Math.round(amount * 100);
  }
}

function isStripeChargeableAmount(amount, currency) {
  const minAmount = MINIMUM_CHARGE_AMOUNT[currency];
  return !minAmount || amount >= minAmount;
}

class PaymentMethodDisabledError extends Error {
  constructor(method) {
    const message = `${method} payments are disabled. See Payment settings in the Swell dashboard for details`;
    super(message);
  }
}

class UnsupportedPaymentMethodError extends Error {
  constructor(method, gateway) {
    let message = `Unsupported payment method: ${method}`;

    if (gateway) {
      message += ` (${gateway})`;
    }

    super(message);
  }
}

class UnableAuthenticatePaymentMethodError extends Error {
  constructor() {
    const message =
      'We are unable to authenticate your payment method. Please choose a different payment method and try again';
    super(message);
  }
}

class LibraryNotLoadedError extends Error {
  constructor(library) {
    const message = `${library} was not loaded`;
    super(message);
  }
}

class MethodPropertyMissingError extends Error {
  constructor(method, property) {
    const message = `${method} ${property} is missing`;
    super(message);
  }
}

class DomElementNotFoundError extends Error {
  constructor(elementId) {
    const message = `DOM element with '${elementId}' ID not found`;
    super(message);
  }
}

class StripeCardPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.card);
  }

  get scripts() {
    return ['stripe-js'];
  }

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

  set stripe(stripe) {
    StripeCardPayment.stripe = stripe;
  }

  get stripeElement() {
    return StripeCardPayment.stripeElement;
  }

  set stripeElement(stripeElement) {
    StripeCardPayment.stripeElement = stripeElement;
  }

  async createElements() {
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

    return this._confirmCardPayment(intent);
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

    if (
      !['requires_capture', 'requires_confirmation'].includes(intent.status)
    ) {
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

    return { status: actionResult.status };
  }
}

class StripeIDealPayment extends Payment {
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

class StripeBancontactPayment extends Payment {
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

  set stripe(stripe) {
    StripeBancontactPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const { source, error: sourceError } = await createBancontactSource(
      this.stripe,
      cart,
    );

    if (sourceError) {
      throw new Error(sourceError.message);
    }

    await this.updateCart({
      billing: {
        method: 'bancontact',
      },
    });

    window.location.replace(source.redirect.url);
  }
}

class StripeKlarnaPayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.klarna,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeKlarnaPayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeKlarnaPayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeKlarnaPayment.stripe;
  }

  set stripe(stripe) {
    StripeKlarnaPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const intent = await this.createIntent({
      gateway: 'stripe',
      intent: getKlarnaIntentDetails(cart),
    });
    const { error } = await this.stripe.confirmKlarnaPayment(
      intent.client_secret,
      getKlarnaConfirmationDetails(cart),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async handleRedirect(queryParams) {
    const { redirect_status, payment_intent_client_secret } = queryParams;

    if (redirect_status !== 'succeeded') {
      throw new UnableAuthenticatePaymentMethodError();
    }

    const { paymentIntent, error } = await this.stripe.retrievePaymentIntent(
      payment_intent_client_secret,
    );

    if (error) {
      throw new Error(error.message);
    }

    await this.updateCart({
      billing: {
        method: 'klarna',
        klarna: {
          token: paymentIntent.payment_method,
        },
        intent: {
          stripe: {
            id: paymentIntent.id,
          },
        },
      },
    });

    this.onSuccess();
  }
}

const VERSION$1 = '2018-10-31';
const API_VERSION$1 = 2;
const API_MINOR_VERSION$1 = 0;
const ALLOWED_CARD_AUTH_METHODS$1 = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
const ALLOWED_CARD_NETWORKS$1 = [
  'AMEX',
  'DISCOVER',
  'INTERAC',
  'JCB',
  'MASTERCARD',
  'VISA',
];

class StripeGooglePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.google,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['google-pay'];
  }

  get google() {
    if (!window.google) {
      throw new LibraryNotLoadedError('Google');
    }

    return window.google;
  }

  get googleClient() {
    if (!StripeGooglePayment.googleClient) {
      if (this.google) {
        this.googleClient = new this.google.payments.api.PaymentsClient({
          environment: isLiveMode(this.method.mode) ? 'PRODUCTION' : 'TEST',
        });
      }

      if (!StripeGooglePayment.googleClient) {
        throw new LibraryNotLoadedError('Google client');
      }
    }

    return StripeGooglePayment.googleClient;
  }

  set googleClient(googleClient) {
    StripeGooglePayment.googleClient = googleClient;
  }

  get tokenizationSpecification() {
    const publishableKey = this.method.publishable_key;

    if (!publishableKey) {
      throw new Error('Stripe publishable key is not defined');
    }

    return {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'stripe',
        'stripe:version': VERSION$1,
        'stripe:publishableKey': publishableKey,
      },
    };
  }

  get cardPaymentMethod() {
    return {
      type: 'CARD',
      tokenizationSpecification: this.tokenizationSpecification,
      parameters: {
        allowedAuthMethods: ALLOWED_CARD_AUTH_METHODS$1,
        allowedCardNetworks: ALLOWED_CARD_NETWORKS$1,
        billingAddressRequired: true,
        billingAddressParameters: {
          format: 'FULL',
          phoneNumberRequired: true,
        },
      },
    };
  }

  get allowedPaymentMethods() {
    return [this.cardPaymentMethod];
  }

  async createElements() {
    if (!this.method.merchant_id) {
      throw new Error('Google merchant ID is not defined');
    }

    const isReadyToPay = await this.googleClient.isReadyToPay({
      apiVersion: API_VERSION$1,
      apiVersionMinor: API_MINOR_VERSION$1,
      allowedPaymentMethods: this.allowedPaymentMethods,
      existingPaymentMethodRequired: true,
    });

    if (!isReadyToPay.result) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    const cart = await this.getCart();
    const paymentRequestData = this._createPaymentRequestData(cart);

    this._renderButton(paymentRequestData);
  }

  _createPaymentRequestData(cart) {
    const {
      settings: { name },
      capture_total,
      currency,
    } = cart;
    const { require: { email, shipping, phone } = {} } = this.params;

    return {
      apiVersion: API_VERSION$1,
      apiVersionMinor: API_MINOR_VERSION$1,
      transactionInfo: {
        currencyCode: currency,
        totalPrice: capture_total.toString(),
        totalPriceStatus: 'ESTIMATED',
      },
      allowedPaymentMethods: this.allowedPaymentMethods,
      emailRequired: Boolean(email),
      shippingAddressRequired: Boolean(shipping),
      shippingAddressParameters: {
        phoneNumberRequired: Boolean(phone),
      },
      merchantInfo: {
        merchantName: name,
        merchantId: this.method.merchant_id,
      },
    };
  }

  _renderButton(paymentRequestData) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      style: { color = 'black', type = 'buy', sizeMode = 'fill' } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    if (classes.base) {
      container.classList.add(classes.base);
    }

    const button = this.googleClient.createButton({
      buttonColor: color,
      buttonType: type,
      buttonSizeMode: sizeMode,
      buttonLocale: locale,
      onClick: this._onClick.bind(this, paymentRequestData),
    });

    container.appendChild(button);
  }

  async _onClick(paymentRequestData) {
    try {
      const paymentData = await this.googleClient.loadPaymentData(
        paymentRequestData,
      );

      if (paymentData) {
        await this._submitPayment(paymentData);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  async _submitPayment(paymentData) {
    const { require: { shipping: requireShipping } = {} } = this.params;
    const { email, shippingAddress, paymentMethodData } = paymentData;
    const {
      info: { billingAddress },
      tokenizationData,
    } = paymentMethodData;
    const token = JSON.parse(tokenizationData.token);
    const { card } = token;

    await this.updateCart({
      account: {
        email,
      },
      billing: {
        method: 'card',
        card: {
          token: token.id,
          brand: card.brand,
          last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          gateway: 'stripe',
        },
        ...this._mapAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: this._mapAddress(shippingAddress),
      }),
    });

    this.onSuccess();
  }

  _mapAddress(address) {
    return {
      name: address.name,
      address1: address.address1,
      address2: address.address2,
      city: address.locality,
      state: address.administrativeArea,
      zip: address.postalCode,
      country: address.countryCode,
      phone: address.phoneNumber,
    };
  }
}

class StripeApplePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.apple,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeApplePayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeApplePayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeApplePayment.stripe;
  }

  set stripe(stripe) {
    StripeApplePayment.stripe = stripe;
  }

  async createElements() {
    await this._authorizeDomain();

    const cart = await this.getCart();
    const paymentRequest = this._createPaymentRequest(cart);
    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment || !canMakePayment.applePay) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    this._renderButton(paymentRequest);
  }

  async _authorizeDomain() {
    const domain = window.location.hostname;
    const authorization = await this.authorizeGateway({
      gateway: 'stripe',
      params: {
        applepay_domain: domain,
      },
    });

    if (!authorization) {
      throw new Error(`${domain} domain is not verified`);
    }
  }

  _createPaymentRequest(cart) {
    const { require: { name, email, shipping, phone } = {} } = this.params;

    const paymentRequest = this.stripe.paymentRequest({
      requestPayerName: Boolean(name),
      requestPayerEmail: Boolean(email),
      requestPayerPhone: Boolean(phone),
      requestShipping: Boolean(shipping),
      disableWallets: ['googlePay', 'browserCard', 'link'],
      ...this._getPaymentRequestData(cart),
    });

    paymentRequest.on(
      'shippingaddresschange',
      this._onShippingAddressChange.bind(this),
    );
    paymentRequest.on(
      'shippingoptionchange',
      this._onShippingOptionChange.bind(this),
    );
    paymentRequest.on('paymentmethod', this._onPaymentMethod.bind(this));

    return paymentRequest;
  }

  _renderButton(paymentRequest) {
    const {
      elementId = 'applepay-button',
      style: { type = 'default', theme = 'dark', height = '40px' } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    const button = this.stripe.elements().create('paymentRequestButton', {
      paymentRequest,
      style: {
        paymentRequestButton: {
          type,
          theme,
          height,
        },
      },
      classes,
    });

    button.mount(`#${elementId}`);
  }

  _getPaymentRequestData(cart) {
    const {
      currency,
      shipping,
      items,
      capture_total,
      shipment_rating,
      shipment_total,
      tax_included_total,
      settings,
    } = cart;

    const stripeCurrency = currency.toLowerCase();
    const displayItems = items.map((item) => ({
      label: item.product.name,
      amount: stripeAmountByCurrency(
        currency,
        item.price_total - item.discount_total,
      ),
    }));

    if (tax_included_total) {
      displayItems.push({
        label: 'Taxes',
        amount: stripeAmountByCurrency(currency, tax_included_total),
      });
    }

    if (shipping.price && shipment_total) {
      displayItems.push({
        label: shipping.service_name,
        amount: stripeAmountByCurrency(currency, shipment_total),
      });
    }

    const services = shipment_rating && shipment_rating.services;
    let shippingOptions;
    if (services) {
      shippingOptions = services.map((service) => ({
        id: service.id,
        label: service.name,
        detail: service.description,
        amount: stripeAmountByCurrency(currency, service.price),
      }));
    }

    return {
      country: settings.country,
      currency: stripeCurrency,
      total: {
        label: settings.name,
        amount: stripeAmountByCurrency(currency, capture_total),
        pending: true,
      },
      displayItems,
      shippingOptions,
    };
  }

  async _onShippingAddressChange(event) {
    const { shippingAddress, updateWith } = event;
    const shipping = this._mapShippingAddress(shippingAddress);
    const cart = await this.updateCart({
      shipping: { ...shipping, service: null },
      shipment_rating: null,
    });

    if (cart) {
      updateWith({ status: 'success', ...this._getPaymentRequestData(cart) });
    } else {
      updateWith({ status: 'invalid_shipping_address' });
    }
  }

  async _onShippingOptionChange(event) {
    const { shippingOption, updateWith } = event;
    const cart = await this.updateCart({
      shipping: { service: shippingOption.id },
    });

    if (cart) {
      updateWith({ status: 'success', ...this._getPaymentRequestData(cart) });
    } else {
      updateWith({ status: 'fail' });
    }
  }

  async _onPaymentMethod(event) {
    const {
      payerEmail,
      paymentMethod: { id: paymentMethod, card, billing_details },
      shippingAddress,
      shippingOption,
      complete,
    } = event;
    const { require: { shipping: requireShipping } = {} } = this.params;

    await this.updateCart({
      account: {
        email: payerEmail,
      },
      ...(requireShipping && {
        shipping: {
          ...this._mapShippingAddress(shippingAddress),
          service: shippingOption.id,
        },
      }),
      billing: {
        ...this._mapBillingAddress(billing_details),
        method: 'card',
        card: {
          gateway: 'stripe',
          token: paymentMethod,
          brand: card.brand,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          last4: card.last4,
          address_check: card.checks.address_line1_check,
          zip_check: card.checks.address_postal_code_check,
          cvc_check: card.checks.cvc_check,
        },
      },
    });

    complete('success');

    this.onSuccess();
  }

  _mapShippingAddress(address = {}) {
    return {
      name: address.recipient,
      address1: address.addressLine[0],
      address2: address.addressLine[1],
      city: address.city,
      state: address.region,
      zip: address.postalCode,
      country: address.country,
      phone: address.phone,
    };
  }

  _mapBillingAddress(address = {}) {
    return {
      name: address.name,
      phone: address.phone,
      address1: address.address.line1,
      address2: address.address.line2,
      city: address.address.city,
      state: address.address.state,
      zip: address.address.postal_code,
      country: address.address.country,
    };
  }
}

class BraintreePaypalPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id, merchant_id } = this.method;

    return [
      { id: 'braintree-paypal-sdk', params: { client_id, merchant_id } },
      'braintree-web',
      'braintree-web-paypal-checkout',
    ];
  }

  get paypal() {
    if (!window.paypal) {
      throw new LibraryNotLoadedError('PayPal');
    }

    return window.paypal;
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get braintreePaypalCheckout() {
    if (!this.braintree.paypalCheckout) {
      throw new LibraryNotLoadedError('Braintree PayPal Checkout');
    }

    return this.braintree.paypalCheckout;
  }

  async createElements() {
    const cart = await this.getCart();
    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    const braintreeClient = await this.braintree.client.create({
      authorization,
    });
    const paypalCheckout = await this.braintreePaypalCheckout.create({
      client: braintreeClient,
    });
    const button = this.paypal.Buttons({
      style: this.params.style || {},
      createBillingAgreement: this._onCreateBillingAgreement.bind(
        this,
        paypalCheckout,
        cart,
      ),
      onApprove: this._onApprove.bind(this, paypalCheckout),
      onCancel: this.onCancel.bind(this),
      onError: this.onError.bind(this),
    });

    button.render(this.params.elementId || '#paypal-button');
  }

  _onCreateBillingAgreement(paypalCheckout, cart) {
    return paypalCheckout.createPayment({
      flow: 'vault',
      currency: cart.currency,
      amount: cart.capture_total,
    });
  }

  async _onApprove(paypalCheckout, data, actions) {
    const { nonce } = await paypalCheckout.tokenizePayment(data);

    await this.updateCart({
      billing: {
        method: 'paypal',
        paypal: {
          nonce,
        },
      },
    });

    this.onSuccess(data, actions);
  }
}

const API_VERSION = 2;
const API_MINOR_VERSION = 0;
const ALLOWED_CARD_AUTH_METHODS = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
const ALLOWED_CARD_NETWORKS = [
  'AMEX',
  'DISCOVER',
  'INTERAC',
  'JCB',
  'MASTERCARD',
  'VISA',
];

class BraintreeGooglePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(request, options, params, methods.google);
  }

  get scripts() {
    return ['google-pay', 'braintree-web', 'braintree-google-payment'];
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get google() {
    if (!window.google) {
      throw new LibraryNotLoadedError('Google');
    }

    return window.google;
  }

  get googleClient() {
    if (!BraintreeGooglePayment.googleClient) {
      if (this.google) {
        this.googleClient = new this.google.payments.api.PaymentsClient({
          environment: isLiveMode(this.method.mode) ? 'PRODUCTION' : 'TEST',
        });
      }

      if (!BraintreeGooglePayment.googleClient) {
        throw new LibraryNotLoadedError('Google client');
      }
    }

    return BraintreeGooglePayment.googleClient;
  }

  set googleClient(googleClient) {
    BraintreeGooglePayment.googleClient = googleClient;
  }

  get cardPaymentMethod() {
    return {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ALLOWED_CARD_AUTH_METHODS,
        allowedCardNetworks: ALLOWED_CARD_NETWORKS,
        billingAddressRequired: true,
        billingAddressParameters: {
          format: 'FULL',
          phoneNumberRequired: true,
        },
      },
    };
  }

  get allowedPaymentMethods() {
    return [this.cardPaymentMethod];
  }

  async createElements() {
    if (!this.method.merchant_id) {
      throw new Error('Google merchant ID is not defined');
    }

    const isReadyToPay = await this.googleClient.isReadyToPay({
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      allowedPaymentMethods: this.allowedPaymentMethods,
      existingPaymentMethodRequired: true,
    });

    if (!isReadyToPay.result) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    const braintreeClient = await this._createBraintreeClient();
    const googlePayment = await this.braintree.googlePayment.create({
      client: braintreeClient,
      googleMerchantId: this.method.merchant_id,
      googlePayVersion: API_VERSION,
    });
    const cart = await this.getCart();
    const paymentRequestData = this._createPaymentRequestData(cart);
    const paymentDataRequest =
      googlePayment.createPaymentDataRequest(paymentRequestData);

    this._renderButton(googlePayment, paymentDataRequest);
  }

  async _createBraintreeClient() {
    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    return this.braintree.client.create({
      authorization,
    });
  }

  _createPaymentRequestData(cart) {
    const {
      settings: { name },
      capture_total,
      currency,
    } = cart;
    const { require: { email, shipping, phone } = {} } = this.params;

    return {
      apiVersion: API_VERSION,
      apiVersionMinor: API_MINOR_VERSION,
      transactionInfo: {
        currencyCode: currency,
        totalPrice: capture_total.toString(),
        totalPriceStatus: 'ESTIMATED',
      },
      allowedPaymentMethods: this.allowedPaymentMethods,
      emailRequired: Boolean(email),
      shippingAddressRequired: Boolean(shipping),
      shippingAddressParameters: {
        phoneNumberRequired: Boolean(phone),
      },
      merchantInfo: {
        merchantName: name,
        merchantId: this.method.merchant_id,
      },
    };
  }

  _renderButton(googlePayment, paymentDataRequest) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      style: { color = 'black', type = 'buy', sizeMode = 'fill' } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    if (classes.base) {
      container.classList.add(classes.base);
    }

    const button = this.googleClient.createButton({
      buttonColor: color,
      buttonType: type,
      buttonSizeMode: sizeMode,
      buttonLocale: locale,
      onClick: this._onClick.bind(this, googlePayment, paymentDataRequest),
    });

    container.appendChild(button);
  }

  async _onClick(googlePayment, paymentDataRequest) {
    try {
      const paymentData = await this.googleClient.loadPaymentData(
        paymentDataRequest,
      );

      if (paymentData) {
        await this._submitPayment(googlePayment, paymentData);
      }
    } catch (error) {
      this.onError(error);
    }
  }

  async _submitPayment(googlePayment, paymentData) {
    const { require: { shipping: requireShipping } = {} } = this.params;
    const { nonce } = await googlePayment.parseResponse(paymentData);
    const { email, shippingAddress, paymentMethodData } = paymentData;
    const {
      info: { billingAddress },
    } = paymentMethodData;

    await this.updateCart({
      account: {
        email,
      },
      billing: {
        method: 'google',
        google: {
          nonce,
          gateway: 'braintree',
        },
        ...this._mapAddress(billingAddress),
      },
      ...(requireShipping && {
        shipping: this._mapAddress(shippingAddress),
      }),
    });

    this.onSuccess();
  }

  _mapAddress(address) {
    return {
      name: address.name,
      address1: address.address1,
      address2: address.address2,
      city: address.locality,
      state: address.administrativeArea,
      zip: address.postalCode,
      country: address.countryCode,
      phone: address.phoneNumber,
    };
  }
}

const VERSION = 3;
const MERCHANT_CAPABILITIES = [
  'supports3DS',
  'supportsDebit',
  'supportsCredit',
];

class BraintreeApplePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(request, options, params, methods.apple);
  }

  get scripts() {
    return ['braintree-web', 'braintree-apple-payment'];
  }

  get braintree() {
    if (!window.braintree) {
      throw new LibraryNotLoadedError('Braintree');
    }

    return window.braintree;
  }

  get ApplePaySession() {
    if (!window.ApplePaySession) {
      throw new LibraryNotLoadedError('Apple');
    }

    return window.ApplePaySession;
  }

  async createElements() {
    if (!this.ApplePaySession.canMakePayments()) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    const cart = await this.getCart();
    const braintreeClient = await this._createBraintreeClient();
    const applePayment = await this.braintree.applePay.create({
      client: braintreeClient,
    });
    const paymentRequest = await this._createPaymentRequest(cart, applePayment);

    this._renderButton(applePayment, paymentRequest);
  }

  _renderButton(applePayment, paymentRequest) {
    const {
      elementId = 'applepay-button',
      style: { type = 'plain', theme = 'black', height = '40px' } = {},
      classes = {},
    } = this.params;
    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    if (classes.base) {
      container.classList.add(classes.base);
    }

    const button = document.createElement('div');

    button.style.appearance = '-apple-pay-button';
    button.style['-apple-pay-button-type'] = type;
    button.style['-apple-pay-button-style'] = theme;
    button.style.height = height;

    button.addEventListener(
      'click',
      this._createPaymentSession.bind(this, applePayment, paymentRequest),
    );

    container.appendChild(button);
  }

  async _createBraintreeClient() {
    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    return this.braintree.client.create({
      authorization,
    });
  }

  _createPaymentRequest(cart, applePayment) {
    const { require = {} } = this.params;
    const {
      settings: { name },
      capture_total,
      currency,
    } = cart;

    const requiredShippingContactFields = [];
    const requiredBillingContactFields = ['postalAddress'];

    if (require.name) {
      requiredShippingContactFields.push('name');
    }
    if (require.email) {
      requiredShippingContactFields.push('email');
    }
    if (require.phone) {
      requiredShippingContactFields.push('phone');
    }
    if (require.shipping) {
      requiredShippingContactFields.push('postalAddress');
    }

    return applePayment.createPaymentRequest({
      total: {
        label: name,
        type: 'pending',
        amount: capture_total.toString(),
      },
      currencyCode: currency,
      merchantCapabilities: MERCHANT_CAPABILITIES,
      requiredShippingContactFields,
      requiredBillingContactFields,
    });
  }

  _createPaymentSession(applePayment, paymentRequest) {
    const session = new this.ApplePaySession(VERSION, paymentRequest);

    session.onvalidatemerchant = async (event) => {
      const merchantSession = await applePayment
        .performValidation({
          validationURL: event.validationURL,
          displayName: paymentRequest.total.label,
        })
        .catch(this.onError.bind(this));

      if (merchantSession) {
        session.completeMerchantValidation(merchantSession);
      } else {
        session.abort();
      }
    };

    session.onpaymentauthorized = async (event) => {
      const {
        payment: { token, shippingContact, billingContact },
      } = event;
      const { require: { shipping: requireShipping } = {} } = this.params;
      const payload = await applePayment
        .tokenize({ token })
        .catch(this.onError.bind(this));

      if (!payload) {
        return session.completePayment(this.ApplePaySession.STATUS_FAILURE);
      }

      await this.updateCart({
        account: {
          email: shippingContact.emailAddress,
        },
        billing: {
          method: 'apple',
          apple: {
            nonce: payload.nonce,
            gateway: 'braintree',
          },
          ...this._mapAddress(billingContact),
        },
        ...(requireShipping && {
          shipping: this._mapAddress(shippingContact),
        }),
      });

      this.onSuccess();

      return session.completePayment(this.ApplePaySession.STATUS_SUCCESS);
    };

    session.begin();
  }

  _mapAddress(address = {}) {
    return {
      first_name: address.givenName,
      last_name: address.familyName,
      address1: address.addressLines[0],
      address2: address.addressLines[1],
      city: address.locality,
      state: address.administrativeArea,
      zip: address.postalCode,
      country: address.countryCode,
      phone: address.phoneNumber,
    };
  }
}

class QuickpayCardPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.card);
  }

  get orderId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async tokenize() {
    const cart = await this.getCart();
    const intent = await this.createIntent({
      gateway: 'quickpay',
      intent: {
        order_id: this.orderId,
        currency: cart.currency || 'USD',
      },
    });

    await this.updateCart({
      billing: {
        method: 'card',
        intent: {
          quickpay: {
            id: intent,
          },
        },
      },
    });

    const returnUrl = window.location.origin + window.location.pathname;
    const authorization = await this.authorizeGateway({
      gateway: 'quickpay',
      params: {
        action: 'create',
        continueurl: `${returnUrl}?gateway=quickpay&redirect_status=succeeded`,
        cancelurl: `${returnUrl}?gateway=quickpay&redirect_status=canceled`,
      },
    });

    if (authorization && authorization.url) {
      window.location.replace(authorization.url);
    }
  }

  async handleRedirect(queryParams) {
    const { redirect_status: status, card_id: id } = queryParams;

    switch (status) {
      case 'succeeded':
        return this._handleSuccessfulRedirect(id);
      case 'canceled':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${status}`);
    }
  }

  async _handleSuccessfulRedirect(cardId) {
    const card = await this.authorizeGateway({
      gateway: 'quickpay',
      params: { action: 'get', id: cardId },
    });

    if (card.error) {
      throw new Error(card.error.message);
    }

    await this.updateCart({
      billing: {
        method: 'card',
        card,
      },
    });

    this.onSuccess();
  }
}

function createPaysafecardPaymentData(cart) {
  const returnUrl = window.location.origin + window.location.pathname;
  const url = `${returnUrl}?gateway=paysafecard`;

  return {
    type: 'PAYSAFECARD',
    amount: cart.capture_total,
    redirect: {
      success_url: url,
      failure_url: url,
    },
    notification_url: url,
    customer: {
      id: get(cart, 'account.id'),
    },
    currency: get(cart, 'currency', 'USD'),
  };
}

class PaysafecardDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paysafecard);
  }

  async tokenize() {
    const cart = await this.getCart();
    const intentData = createPaysafecardPaymentData(cart);
    const intent = await this.createIntent({
      gateway: 'paysafecard',
      intent: intentData,
    });

    if (!intent) {
      throw new Error('Paysafecard payment is not defined');
    }

    await this.updateCart({
      billing: {
        method: 'paysafecard',
        intent: {
          paysafecard: {
            id: intent.id,
          },
        },
      },
    });

    window.location.replace(intent.redirect.auth_url);
  }

  async handleRedirect() {
    const cart = await this.getCart();
    const paymentId = get(cart, 'billing.intent.paysafecard.id');

    if (!paymentId) {
      throw new Error('Paysafecard payment ID is not defined');
    }

    const intent = await this.updateIntent({
      gateway: 'paysafecard',
      intent: { payment_id: paymentId },
    });

    if (!intent) {
      throw new Error('Paysafecard payment is not defined');
    }

    switch (intent.status) {
      case 'SUCCESS':
      case 'AUTHORIZED':
        return this.onSuccess();
      case 'CANCELED_CUSTOMER':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${intent.status}.`);
    }
  }
}

const addressFieldsMap = {
  given_name: 'first_name',
  family_name: 'last_name',
  city: 'city',
  country: 'country',
  phone: 'phone',
  postal_code: 'zip',
  street_address: 'address1',
  street_address2: 'address2',
  region: 'state',
};

const mapFields = (fieldsMap, data) =>
  reduce(
    fieldsMap,
    (acc, srcKey, destKey) => {
      const value = data[srcKey];
      if (value) {
        acc[destKey] = value;
      }
      return acc;
    },
    {},
  );

const mapAddressFields = (cart, addressField) => ({
  ...mapFields(addressFieldsMap, cart[addressField]),
  email: get(cart, 'account.email'),
});

function getOrderLines(cart) {
  const items = map(cart.items, (item) => ({
    type: 'physical',
    name: get(item, 'product.name'),
    reference: get(item, 'product.sku') || get(item, 'product.slug'),
    quantity: item.quantity,
    unit_price: Math.round(toNumber(item.price - item.discount_each) * 100),
    total_amount: Math.round(
      toNumber(item.price_total - item.discount_total) * 100,
    ),
    tax_rate: 0,
    total_tax_amount: 0,
  }));

  const tax = get(cart, 'tax_included_total');
  const taxAmount = toNumber(tax) * 100;
  if (tax) {
    items.push({
      type: 'sales_tax',
      name: 'Taxes',
      quantity: 1,
      unit_price: taxAmount,
      total_amount: taxAmount,
      tax_rate: 0,
      total_tax_amount: 0,
    });
  }

  const shipping = get(cart, 'shipping', {});
  const shippingTotal = get(cart, 'shipment_total', {});
  const shippingAmount = toNumber(shippingTotal) * 100;
  if (shipping.price) {
    items.push({
      type: 'shipping_fee',
      name: shipping.service_name,
      quantity: 1,
      unit_price: shippingAmount,
      total_amount: shippingAmount,
      tax_rate: 0,
      total_tax_amount: 0,
    });
  }

  return items;
}

function getKlarnaSessionData(cart) {
  const returnUrl = `${window.location.origin}${window.location.pathname}?gateway=klarna_direct&sid={{session_id}}`;
  const successUrl = `${returnUrl}&authorization_token={{authorization_token}}`;

  return {
    locale: cart.display_locale || get(cart, 'settings.locale') || 'en-US',
    purchase_country:
      get(cart, 'billing.country') || get(cart, 'shipping.country'),
    purchase_currency: cart.currency,
    billing_address: mapAddressFields(cart, 'billing'),
    shipping_address: mapAddressFields(cart, 'shipping'),
    order_amount: Math.round(get(cart, 'capture_total', 0) * 100),
    order_lines: JSON.stringify(getOrderLines(cart)),
    merchant_urls: {
      success: successUrl,
      back: returnUrl,
      cancel: returnUrl,
      error: returnUrl,
      failure: returnUrl,
    },
  };
}

class KlarnaDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.klarna);
  }

  async tokenize() {
    const cart = await this.getCart();
    const sessionData = getKlarnaSessionData(cart);
    const session = await this.createIntent({
      gateway: 'klarna',
      intent: sessionData,
    });

    if (!session) {
      throw new Error('Klarna session is not defined');
    }

    window.location.replace(session.redirect_url);
  }

  async handleRedirect(queryParams) {
    const { authorization_token } = queryParams;

    if (!authorization_token) {
      throw new UnableAuthenticatePaymentMethodError();
    }

    await this.updateCart({
      billing: {
        method: 'klarna',
        klarna: {
          token: authorization_token,
        },
      },
    });

    this.onSuccess();
  }
}

class PaypalDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id, merchant_id } = this.method;

    return [
      {
        id: 'paypal-sdk',
        params: {
          client_id,
          merchant_id,
          cart: ['currency'],
        },
      },
    ];
  }

  get paypal() {
    if (!window.paypal) {
      throw new LibraryNotLoadedError('PayPal');
    }

    return window.paypal;
  }

  async createElements() {
    const cart = await this.getCart();
    const { locale, style, elementId } = this.params;

    if (!(cart.capture_total > 0)) {
      throw new Error(
        'Invalid PayPal button amount. Value should be greater than zero.',
      );
    }

    const button = this.paypal.Buttons({
      locale: locale || 'en_US',
      style: style || {
        layout: 'horizontal',
        height: 45,
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        tagline: false,
      },
      createOrder: this._onCreateOrder.bind(this, cart),
      onApprove: this._onApprove.bind(this, cart),
      onError: this.onError.bind(this),
    });

    button.render(elementId || '#paypal-button');
  }

  _onCreateOrder(cart, data, actions) {
    const { capture_total, currency } = cart;

    return actions.order.create({
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          amount: {
            value: +capture_total.toFixed(2),
            currency_code: currency,
          },
        },
      ],
    });
  }

  async _onApprove(cart, data, actions) {
    const order = await actions.order.get();
    const orderId = order.id;
    const payer = order.payer;
    const shipping = get(order, 'purchase_units[0].shipping');

    await this.updateCart({
      account: {
        email: payer.email_address,
      },
      billing: {
        method: 'paypal',
        paypal: {
          order_id: orderId,
        },
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

    this.onSuccess();
  }
}

class AmazonDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.amazon);
  }

  get scripts() {
    return ['amazon-checkout'];
  }

  get amazon() {
    if (!window.amazon) {
      throw new LibraryNotLoadedError('Amazon');
    }

    return window.amazon;
  }

  get merchantId() {
    const merchantId = this.method.merchant_id;

    if (!merchantId) {
      throw new MethodPropertyMissingError('Amazon', 'merchant_id');
    }

    return merchantId;
  }

  get publicKeyId() {
    const publicKeyId = this.method.public_key_id;

    if (!publicKeyId) {
      throw new MethodPropertyMissingError('Amazon', 'public_key_id');
    }

    return publicKeyId;
  }

  get returnUrl() {
    return `${
      window.location.origin + window.location.pathname
    }?gateway=amazon`;
  }

  async createElements() {
    const cart = await this.getCart();
    const returnUrl = this.returnUrl;
    const isSubscription = Boolean(cart.subscription_delivery);
    const session = await this.authorizeGateway({
      gateway: 'amazon',
      params: {
        chargePermissionType: isSubscription ? 'Recurring' : 'OneTime',
        ...(isSubscription
          ? {
              recurringMetadata: {
                frequency: {
                  unit: 'Variable',
                  value: '0',
                },
              },
            }
          : {}),
        webCheckoutDetails: {
          checkoutReviewReturnUrl: `${returnUrl}&redirect_status=succeeded`,
          checkoutCancelUrl: `${returnUrl}&redirect_status=canceled`,
        },
      },
    });

    this._renderButton(cart, session);
  }

  async tokenize() {
    const cart = await this.getCart();
    const returnUrl = this.returnUrl;
    const checkoutSessionId = get(cart, 'billing.amazon.checkout_session_id');

    if (!checkoutSessionId) {
      throw new Error(
        'Missing Amazon Pay checkout session ID (billing.amazon.checkout_session_id)',
      );
    }

    const intent = await this.createIntent({
      gateway: 'amazon',
      intent: {
        checkoutSessionId,
        webCheckoutDetails: {
          checkoutResultReturnUrl: `${returnUrl}&confirm=true&redirect_status=succeeded`,
          checkoutCancelUrl: `${returnUrl}&redirect_status=canceled`,
        },
        paymentDetails:
          cart.capture_total > 0
            ? {
                paymentIntent: 'Authorize',
                canHandlePendingAuthorization: true,
                chargeAmount: {
                  amount: cart.capture_total,
                  currencyCode: cart.currency,
                },
              }
            : {
                // Just confirm payment to save payment details when capture total amount is 0.
                // e.g. trial subscription, 100% discount or items.price = 0
                paymentIntent: 'Confirm',
              },
      },
    });

    return window.location.replace(intent.redirect_url);
  }

  async handleRedirect(queryParams) {
    const { redirect_status } = queryParams;

    switch (redirect_status) {
      case 'succeeded':
        return this._handleSuccessfulRedirect(queryParams);
      case 'canceled':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${redirect_status}`);
    }
  }

  _renderButton(cart, session) {
    const amazon = this.amazon;
    const merchantId = this.merchantId;
    const publicKeyId = this.publicKeyId;
    const { payload: payloadJSON, signature } = session;
    const {
      elementId = 'amazonpay-button',
      locale = 'en_US',
      placement = 'Checkout',
      style: { color = 'Gold' } = {},
      require: { shipping: requireShipping } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    amazon.Pay.renderButton(`#${elementId}`, {
      ledgerCurrency: cart.currency,
      checkoutLanguage: locale,
      productType: Boolean(requireShipping) ? 'PayAndShip' : 'PayOnly',
      buttonColor: color,
      placement,
      merchantId,
      publicKeyId,
      createCheckoutSessionConfig: {
        payloadJSON,
        signature,
      },
    });

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  async _handleSuccessfulRedirect(queryParams) {
    const { confirm, amazonCheckoutSessionId } = queryParams;

    if (!confirm) {
      await this.updateCart({
        billing: {
          method: 'amazon',
          amazon: {
            checkout_session_id: amazonCheckoutSessionId,
          },
        },
      });
    }

    this.onSuccess();
  }
}

class PaymentController {
  constructor(request, options) {
    this.request = request;
    this.options = options;
  }

  get(id) {
    return this.request('get', '/payments', id);
  }

  async methods() {
    if (this.methodSettings) {
      return this.methodSettings;
    }

    this.methodSettings = await this.request('get', '/payment/methods');

    return this.methodSettings;
  }

  async createElements(params) {
    this.params = params;

    if (!params) {
      throw new Error('Payment element parameters are not provided');
    }

    this._performPaymentAction('createElements');
  }

  async tokenize(params = this.params) {
    this.params = params;

    if (!this.params) {
      throw new Error('Tokenization parameters are not provided');
    }

    this._performPaymentAction('tokenize');
  }

  async handleRedirect(params = this.params) {
    const queryParams = getLocationParams(window.location);

    if (!queryParams || !queryParams.gateway) {
      return;
    }

    this.params = params;

    if (!params) {
      throw new Error('Redirect parameters are not provided');
    }

    removeUrlParams();
    this._performPaymentAction('handleRedirect', queryParams);
  }

  async authenticate(id) {
    try {
      const payment = await this.get(id);

      if (!payment) {
        throw new Error('Payment not found');
      }

      const { method, gateway } = payment;
      const PaymentClass = this._getPaymentClass(method, gateway);

      if (!PaymentClass) {
        throw new UnsupportedPaymentMethodError(method, gateway);
      }

      const paymentMethods = await this._getPaymentMethods();
      const methodSettings = paymentMethods[method];

      if (!methodSettings) {
        throw new PaymentMethodDisabledError(method);
      }

      const paymentInstance = new PaymentClass(
        this.request,
        this.options,
        null,
        paymentMethods,
      );

      await paymentInstance.loadScripts(paymentInstance.scripts);
      return await paymentInstance.authenticate(payment);
    } catch (error) {
      return { error };
    }
  }

  async createIntent(data) {
    return this._vaultRequest('post', '/intent', data);
  }

  async updateIntent(data) {
    return this._vaultRequest('put', '/intent', data);
  }

  async authorizeGateway(data) {
    return this._vaultRequest('post', '/authorization', data);
  }

  _normalizeParams() {
    if (!this.params) {
      return;
    }

    if (this.params.config) {
      console.warn(
        'Please move the "config" field to the payment method parameters ("card.config" or/and "ideal.config").',
      );

      if (this.params.card) {
        this.params.card.config = this.params.config;
      }

      if (this.params.ideal) {
        this.params.ideal.config = this.params.config;
      }

      delete this.params.config;
    }
  }

  async _getPaymentMethods() {
    const paymentMethods = await methods$1(
      this.request,
      this.options,
    ).payments();

    if (paymentMethods.error) {
      throw new Error(paymentMethods.error);
    }

    return toSnake(paymentMethods);
  }

  async _vaultRequest(method, url, data) {
    const response = await vaultRequest(method, url, data);

    if (response.errors) {
      const param = Object.keys(response.errors)[0];
      const err = new Error(response.errors[param].message || 'Unknown error');
      err.code = 'vault_error';
      err.status = 402;
      err.param = param;
      throw err;
    }

    if (this.options.useCamelCase) {
      return toCamel(response);
    }

    return response;
  }

  async _performPaymentAction(action, ...args) {
    const paymentMethods = await this._getPaymentMethods();

    this._normalizeParams();

    Object.entries(this.params).forEach(([method, params]) => {
      const methodSettings = paymentMethods[method];

      if (!methodSettings) {
        return console.error(new PaymentMethodDisabledError(method));
      }

      const PaymentClass = this._getPaymentClass(
        method,
        methodSettings.gateway,
      );

      if (!PaymentClass) {
        return console.error(
          new UnsupportedPaymentMethodError(method, methodSettings.gateway),
        );
      }

      try {
        const payment = new PaymentClass(
          this.request,
          this.options,
          params,
          paymentMethods,
        );

        payment
          .loadScripts(payment.scripts)
          .then(payment[action].bind(payment, ...args))
          .catch(payment.onError.bind(payment));
      } catch (error) {
        return console.error(error.message);
      }
    });
  }

  _getPaymentClass(method, gateway) {
    switch (method) {
      case 'card':
        return this._getCardPaymentClass(gateway);
      case 'ideal':
        return this._getIDealPaymentClass(gateway);
      case 'bancontact':
        return this._getBancontactPaymentClass(gateway);
      case 'klarna':
        return this._getKlarnaPaymentClass(gateway);
      case 'paysafecard':
        return this._getPaysafecardPaymentClass(gateway);
      case 'paypal':
        return this._getPaypalPaymentClass(gateway);
      case 'google':
        return this._getGooglePaymentClass(gateway);
      case 'apple':
        return this._getApplePaymentClass(gateway);
      case 'amazon':
        return this._getAmazonPaymentClass(gateway);
      default:
        return null;
    }
  }

  _getCardPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeCardPayment;
      case 'quickpay':
        return QuickpayCardPayment;
      default:
        return null;
    }
  }

  _getIDealPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeIDealPayment;
      default:
        return null;
    }
  }

  _getBancontactPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeBancontactPayment;
      default:
        return null;
    }
  }

  _getKlarnaPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeKlarnaPayment;
      case 'klarna':
        return KlarnaDirectPayment;
      default:
        return null;
    }
  }

  _getPaysafecardPaymentClass(gateway) {
    switch (gateway) {
      default:
        return PaysafecardDirectPayment;
    }
  }

  _getPaypalPaymentClass(gateway) {
    switch (gateway) {
      case 'braintree':
        return BraintreePaypalPayment;
      default:
        return PaypalDirectPayment;
    }
  }

  _getGooglePaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeGooglePayment;
      case 'braintree':
        return BraintreeGooglePayment;
      default:
        return null;
    }
  }

  _getApplePaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeApplePayment;
      case 'braintree':
        return BraintreeApplePayment;
      default:
        return null;
    }
  }

  _getAmazonPaymentClass(gateway) {
    switch (gateway) {
      default:
        return AmazonDirectPayment;
    }
  }
}

export { PaymentController as P };
