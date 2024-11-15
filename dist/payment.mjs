import methods from './cart.mjs';
import methods$1 from './settings.mjs';
import { b as isObject, k as isFunction, l as loadScript, c as cloneDeep, t as toSnake, v as vaultRequest, p as pick, n as isEmpty, o as isLiveMode, q as map, r as reduce, w as getLocationParams, x as removeUrlParams, a as toCamel } from './index.a911a674.mjs';
import { g as get, t as toNumber } from './find.18f1ac6d.mjs';
import 'qs';
import 'deepmerge';
import 'fast-case';
import './products.mjs';
import './cache.mjs';
import './round.577a8441.mjs';
import './attributes.mjs';

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

const BRAINTREE_VERSION = '3.91.0';

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
    const { currency, client_id, merchant_id } = params;
    const paypalParams = {
      currency,
      'client-id': client_id,
      commit: false,
    };

    if (merchant_id) {
      // paypal express and ppcp onboarded
      paypalParams['merchant-id'] = merchant_id;
      paypalParams.intent = 'authorize';
    } else {
      // ppcp progressive
      paypalParams.intent = 'capture';
    }

    const urlSearchParams = new URLSearchParams(paypalParams).toString();

    await loadScript(
      'paypal-sdk',
      `https://www.paypal.com/sdk/js?${urlSearchParams}`,
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
      `https://js.braintreegateway.com/web/${BRAINTREE_VERSION}/js/client.min.js`,
    );
  }

  if (!window.braintree) {
    console.error('Warning: Braintree was not loaded');
  }
}

async function loadBraintreePaypal(params) {
  if (!window.paypal) {
    const { currency, client_id, merchant_id } = params;
    const paypalParams = {
      currency,
      'client-id': client_id,
      'merchant-id': merchant_id,
      commit: false,
      vault: true,
    };
    const urlSearchParams = new URLSearchParams(paypalParams).toString();

    await loadScript(
      'braintree-paypal-sdk',
      `https://www.paypal.com/sdk/js?${urlSearchParams}`,
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
      `https://js.braintreegateway.com/web/${BRAINTREE_VERSION}/js/paypal-checkout.min.js`,
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
      `https://js.braintreegateway.com/web/${BRAINTREE_VERSION}/js/google-payment.min.js`,
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
      `https://js.braintreegateway.com/web/${BRAINTREE_VERSION}/js/apple-pay.min.js`,
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

class PaymentElementNotCreatedError extends Error {
  constructor(methodName) {
    const message = `The ${methodName} payment element was not created`;
    super(message);
  }
}

class Payment {
  _element = null;
  _elementContainer = null;

  constructor(api, options, params, method) {
    this.api = api;
    this.options = options;
    this.params = params;
    this.method = method;
  }

  /**
   * Returns a payment element.
   *
   * @returns {any}
   */
  get element() {
    if (!this._element) {
      throw new PaymentElementNotCreatedError(this.method.name);
    }

    return this._element;
  }

  /**
   * Sets a payment element.
   *
   * @param {any} element
   */
  set element(element) {
    this._element = element;
  }

  /**
   * Returns a HTMLElement container of the payment element.
   *
   * @returns {HTMLElement}
   */
  get elementContainer() {
    return this._elementContainer;
  }

  /**
   * Sets a HTMLElement container of the payment element.
   *
   * @param {string} elementId
   */
  setElementContainer(elementId) {
    this._elementContainer = document.getElementById(elementId);

    if (!this.elementContainer) {
      throw new DomElementNotFoundError(elementId);
    }
  }

  /**
   * Loads payment scripts.
   *
   * @param {Array<string | object>} scripts
   */
  async loadScripts(scripts) {
    await this._populateScriptsParams(scripts);
    await loadScripts(scripts);
  }

  /**
   * Returns a cart.
   *
   * @returns {Promise<object>}
   */
  async getCart() {
    const cart = await methods(this.api, this.options).get();

    if (!cart) {
      throw new Error('Cart not found');
    }

    return this._adjustCart(cart);
  }

  /**
   * Updates a cart.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
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

    const updatedCart = await methods(this.api, this.options).update(
      updateData,
    );

    return this._adjustCart(updatedCart);
  }

  /**
   * Returns the store settings.
   *
   * @returns {Promise<object>}
   */
  async getSettings() {
    return methods$1(this.api, this.options).get();
  }

  /**
   * Creates a payment intent.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
  async createIntent(data) {
    return this._vaultRequest('post', '/intent', data);
  }

  /**
   * Updates a payment intent.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
  async updateIntent(data) {
    return this._vaultRequest('put', '/intent', data);
  }

  /**
   * Authorizes a payment gateway.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
  async authorizeGateway(data) {
    return this._vaultRequest('post', '/authorization', data);
  }

  /**
   * Reset the payment timer to update the payment status faster
   *
   * @param {string} id
   * @returns {Promise<object>}
   */
  resetAsyncPayment(id) {
    return this.api.request('put', '/payments', id, {
      $reset_async_payment: true,
    });
  }

  /**
   * Calls the onSuccess handler.
   *
   * @param {object | undefined} data
   * @returns {any}
   */
  onSuccess(data) {
    const successHandler = get(this.params, 'onSuccess');

    if (isFunction(successHandler)) {
      return successHandler(data);
    }
  }

  /**
   * Calls the onCancel handler.
   *
   * @returns {any}
   */
  onCancel() {
    const cancelHandler = get(this.params, 'onCancel');

    if (isFunction(cancelHandler)) {
      return cancelHandler();
    }
  }

  /**
   * Calls the onError handler.
   *
   * @param {Error} error
   * @returns {any}
   */
  onError(error) {
    const errorHandler = get(this.params, 'onError');

    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }

    console.error(error.message);
  }

  /**
   * Adjusts cart data.
   *
   * @param {object} cart
   * @returns {Promise<object>}
   */
  async _adjustCart(cart) {
    return this._ensureCartSettings(cart).then(toSnake);
  }

  /**
   * Sets the store settings to cart.
   *
   * @param {object} cart
   * @returns {Promise<object>}
   */
  async _ensureCartSettings(cart) {
    if (cart.settings) {
      return cart;
    }

    const settings = await this.getSettings();

    return { ...cart, settings: { ...settings.store } };
  }

  /**
   * Sends a Vault request.
   *
   * @param {string} method
   * @param {string} url
   * @param {object} data
   * @returns {Promise<object>}
   */
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

  /**
   * Sets values for payment scripts.
   *
   * @param {Array<string | object>} scripts
   */
  async _populateScriptsParams(scripts = []) {
    for (const script of scripts) {
      await this._populateScriptWithCartParams(script);
    }
  }

  /**
   * Sets the cart values to the payment script params.
   *
   * @param {string | object} script
   */
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

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */
/** @typedef {import('@stripe/stripe-js').StripeCardElement} StripeCardElement */
/** @typedef {import('@stripe/stripe-js').StripeCardNumberElement} StripeCardNumberElement */
/** @typedef {import('@stripe/stripe-js').CreateSourceData} CreateSourceData */

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

/**
 * @param {string} type
 * @param {import('@stripe/stripe-js').StripeElements} elements
 * @param {object} params
 * @returns {import('@stripe/stripe-js').StripeElement}
 */
function createElement(type, elements, params) {
  const elementParams = params[type] || params;
  const elementOptions = elementParams.options || {};
  const elementId = elementParams.elementId || `${type}-element`;
  const element = elements.create(type, elementOptions);

  elementParams.onChange && element.on('change', elementParams.onChange);
  elementParams.onReady && element.on('ready', elementParams.onReady);
  elementParams.onFocus && element.on('focus', elementParams.onFocus);
  elementParams.onBlur && element.on('blur', elementParams.onBlur);
  elementParams.onEscape && element.on('escape', elementParams.onEscape);
  elementParams.onClick && element.on('click', elementParams.onClick);

  element.mount(`#${elementId}`);

  return element;
}

/**
 * @param {Stripe} stripe
 * @param {StripeCardElement | StripeCardNumberElement} cardElement
 * @param {object} cart
 */
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
        display_brand: paymentMethod.card.display_brand,
        address_check: paymentMethod.card.checks.address_line1_check,
        cvc_check: paymentMethod.card.checks.cvc_check,
        zip_check: paymentMethod.card.checks.address_postal_code_check,
      };
}

/**
 * @param {Stripe} stripe
 * @param {import('@stripe/stripe-js').StripeIdealBankElement} element
 * @param {object} cart
 */
async function createIDealPaymentMethod(stripe, element, cart) {
  const billingDetails = getBillingDetails(cart);
  return stripe.createPaymentMethod({
    type: 'ideal',
    ideal: element,
    ...(billingDetails ? { billing_details: billingDetails } : undefined),
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

/**
 * @param {object} cart
 * @returns {import('@stripe/stripe-js').ConfirmKlarnaPaymentData}
 */
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

/**
 * Returns Bancontact Setup Intent confirmation details.
 *
 * @param {object} cart
 * @returns {import('@stripe/stripe-js').ConfirmBancontactPaymentData}
 */
function getBancontactConfirmationDetails(cart) {
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

/**
 * @param {object} cart
 * @param {object} params
 * @returns {import('@stripe/stripe-js').PaymentRequestOptions}
 */
function getPaymentRequestData(cart, params) {
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
  const { price: shippingPrice, service_name } = shipping || {};
  const { country, name } = settings || {};
  const { require: { shipping: requireShipping } = {} } = params;

  const stripeCurrency = currency.toLowerCase();
  const displayItems = items.map((item) => ({
    label: get(item, 'product.name', 'Unknown product'),
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

  if (shippingPrice && shipment_total) {
    displayItems.push({
      label: service_name,
      amount: stripeAmountByCurrency(currency, shipment_total),
    });
  }

  let shippingOptions;
  const services = get(shipment_rating, 'services');
  if (Array.isArray(services) && services.length > 0) {
    shippingOptions = services.map((service) => ({
      id: service.id,
      label: service.name,
      detail: service.description,
      amount: stripeAmountByCurrency(currency, service.price),
    }));
  }

  return {
    country: country || 'US',
    currency: stripeCurrency,
    total: {
      label: name || 'Swell store',
      amount: stripeAmountByCurrency(currency, capture_total),
      pending: true,
    },
    displayItems,
    ...(requireShipping && { shippingOptions }),
  };
}

const zeroDecimalCurrencies = new Set([
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
]);

function stripeAmountByCurrency(currency, amount) {
  if (zeroDecimalCurrencies.has(currency.toUpperCase())) {
    return amount;
  }

  return Math.round(amount * 100);
}

function isStripeChargeableAmount(amount, currency) {
  const minAmount = MINIMUM_CHARGE_AMOUNT[currency];
  return !minAmount || amount >= minAmount;
}

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */
/** @typedef {import('@stripe/stripe-js').StripeCardElement} StripeCardElement */
/** @typedef {import('@stripe/stripe-js').StripeCardNumberElement} StripeCardNumberElement */

class StripeCardPayment extends Payment {
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

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */
/** @typedef {import('@stripe/stripe-js').StripeIdealBankElement} StripeIdealBankElement */

class StripeIDealPayment extends Payment {
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

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */

class StripeBancontactPayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.bancontact,
      publishable_key: methods.card.publishable_key,
    };

    super(api, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  /** @returns {Stripe} */
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

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeBancontactPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const intent = await this.createIntent({
      gateway: 'stripe',
      action: 'setup',
      account_id: cart.account_id,
      intent: {
        payment_method_types: ['bancontact'],
        usage: 'off_session',
      },
    });

    await this.loadScripts(this.scripts);

    const { error } = await this.stripe.confirmBancontactSetup(
      intent.client_secret,
      getBancontactConfirmationDetails(cart),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async handleRedirect(queryParams) {
    const { redirect_status, setup_intent_client_secret } = queryParams;

    if (redirect_status !== 'succeeded') {
      throw new UnableAuthenticatePaymentMethodError();
    }

    await this.loadScripts(this.scripts);

    const { setupIntent, error } = await this.stripe.retrieveSetupIntent(
      setup_intent_client_secret,
    );

    if (error) {
      throw new Error(error.message);
    }

    await this.updateCart({
      billing: {
        method: 'bancontact',
        bancontact: {
          token: setupIntent.id,
        },
      },
    });

    this.onSuccess();
  }
}

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */

class StripeKlarnaPayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.klarna,
      publishable_key: methods.card.publishable_key,
    };

    super(api, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  /** @returns {Stripe} */
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

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeKlarnaPayment.stripe = stripe;
  }

  async tokenize() {
    const cart = await this.getCart();
    const intent = await this.createIntent({
      gateway: 'stripe',
      intent: getKlarnaIntentDetails(cart),
    });

    await this.loadScripts(this.scripts);

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

    await this.loadScripts(this.scripts);

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

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */
/** @typedef {import('@stripe/stripe-js').PaymentRequestPaymentMethodEvent} PaymentRequestPaymentMethodEvent */

class StripeGooglePayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.google,
      publishable_key: methods.card.publishable_key,
    };

    super(api, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  /** @returns {Stripe} */
  get stripe() {
    if (!StripeGooglePayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeGooglePayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeGooglePayment.stripe;
  }

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeGooglePayment.stripe = stripe;
  }

  async createElements(cart) {
    const { elementId = 'googlepay-button', classes = {} } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

    const paymentRequest = this._createPaymentRequest(cart);
    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment?.googlePay) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    this.element = this.stripe.elements().create('paymentRequestButton', {
      paymentRequest,
      style: {
        paymentRequestButton: this._getButtonStyles(),
      },
      classes,
    });
  }

  mountElements() {
    this.element.mount(`#${this.elementContainer.id}`);
  }

  _createPaymentRequest(cart) {
    const { require: { name, email, shipping, phone } = {} } = this.params;

    const paymentRequest = this.stripe.paymentRequest({
      requestPayerName: Boolean(name),
      requestPayerEmail: Boolean(email),
      requestPayerPhone: Boolean(phone),
      requestShipping: Boolean(shipping),
      disableWallets: ['applePay', 'browserCard', 'link'],
      ...getPaymentRequestData(cart, this.params),
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

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingAddressEvent} event */
  async _onShippingAddressChange(event) {
    const { shippingAddress, updateWith } = event;
    const shipping = this._mapShippingAddress(shippingAddress);
    const cart = await this.updateCart({
      shipping: { ...shipping, service: null },
      shipment_rating: null,
    });

    if (cart) {
      updateWith({
        status: 'success',
        ...getPaymentRequestData(cart, this.params),
      });
    } else {
      updateWith({ status: 'invalid_shipping_address' });
    }
  }

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingOptionEvent} event */
  async _onShippingOptionChange(event) {
    const { shippingOption, updateWith } = event;
    const cart = await this.updateCart({
      shipping: { service: shippingOption.id },
    });

    if (cart) {
      updateWith({
        status: 'success',
        ...getPaymentRequestData(cart, this.params),
      });
    } else {
      updateWith({ status: 'fail' });
    }
  }

  /** @param {PaymentRequestPaymentMethodEvent} event */
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
          display_brand: card.display_brand,
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

  /**
   * Provides backward compatibility with Google Pay button options
   *
   * @see {@link https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions}
   */
  _getButtonStyles() {
    let { style: { color = 'dark', type = 'default', height = '45px' } = {} } =
      this.params;

    switch (color) {
      case 'white':
        color = 'light';
        break;
      default:
        color = 'dark';
        break;
    }

    switch (type) {
      case 'buy':
      case 'donate':
        break;
      default:
        type = 'default';
        break;
    }

    return {
      type,
      height,
      theme: color,
    };
  }

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingAddress} [address] */
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

  /** @param {PaymentRequestPaymentMethodEvent['paymentMethod']['billing_details']} [address] */
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

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */
/** @typedef {import('@stripe/stripe-js').PaymentRequestPaymentMethodEvent} PaymentRequestPaymentMethodEvent */

class StripeApplePayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.apple,
      publishable_key: methods.card.publishable_key,
    };

    super(api, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  /** @returns {Stripe} */
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

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeApplePayment.stripe = stripe;
  }

  async createElements(cart) {
    const {
      elementId = 'applepay-button',
      style: { type = 'default', theme = 'dark', height = '40px' } = {},
      classes = {},
    } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);
    await this._authorizeDomain();

    const paymentRequest = this._createPaymentRequest(cart);
    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment || !canMakePayment.applePay) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    this.element = this.stripe.elements().create('paymentRequestButton', {
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
  }

  mountElements() {
    this.element.mount(`#${this.elementContainer.id}`);
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
      ...getPaymentRequestData(cart, this.params),
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

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingAddressEvent} event */
  async _onShippingAddressChange(event) {
    const { shippingAddress, updateWith } = event;
    const shipping = this._mapShippingAddress(shippingAddress);
    const cart = await this.updateCart({
      shipping: { ...shipping, service: null },
      shipment_rating: null,
    });

    if (cart) {
      updateWith({
        status: 'success',
        ...getPaymentRequestData(cart, this.params),
      });
    } else {
      updateWith({ status: 'invalid_shipping_address' });
    }
  }

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingOptionEvent} event */
  async _onShippingOptionChange(event) {
    const { shippingOption, updateWith } = event;
    const cart = await this.updateCart({
      shipping: { service: shippingOption.id },
    });

    if (cart) {
      updateWith({
        status: 'success',
        ...getPaymentRequestData(cart, this.params),
      });
    } else {
      updateWith({ status: 'fail' });
    }
  }

  /** @param {PaymentRequestPaymentMethodEvent} event */
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
          display_brand: card.display_brand,
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

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingAddress} [address] */
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

  /** @param {PaymentRequestPaymentMethodEvent['paymentMethod']['billing_details']} [address] */
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
  constructor(api, options, params, methods) {
    super(api, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id, merchant_id } = this.method;

    return [
      {
        id: 'braintree-paypal-sdk',
        params: { client_id, merchant_id, cart: ['currency'] },
      },
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

  async createElements(cart) {
    const {
      elementId = 'paypal-button',
      locale = 'en_US',
      style: {
        layout = 'horizontal',
        height = 45,
        color = 'gold',
        shape = 'rect',
        label = 'paypal',
        tagline = false,
      } = {},
    } = this.params;

    this.setElementContainer(elementId);

    const authorization = await this.authorizeGateway({
      gateway: 'braintree',
    });

    if (authorization.error) {
      throw new Error(authorization.error.message);
    }

    await this.loadScripts(this.scripts);

    const braintreeClient = await this.braintree.client.create({
      authorization,
    });
    const paypalCheckout = await this.braintreePaypalCheckout.create({
      client: braintreeClient,
    });

    this.element = this.paypal.Buttons({
      locale,
      style: {
        layout,
        height,
        color,
        shape,
        label,
        tagline,
      },
      fundingSource: this.paypal.FUNDING.PAYPAL,
      createBillingAgreement: this._createBillingAgreement.bind(
        this,
        paypalCheckout,
        cart,
      ),
      onApprove: this._onApprove.bind(this, paypalCheckout),
      onCancel: this.onCancel.bind(this),
      onError: this.onError.bind(this),
    });
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    this.element.render(`#${container.id}`);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  _createBillingAgreement(paypalCheckout, cart) {
    const { require: { shipping: requireShipping = true } = {} } = this.params;

    return paypalCheckout.createPayment({
      flow: 'vault',
      amount: cart.capture_total,
      currency: cart.currency,
      requestBillingAgreement: true,
      enableShippingAddress: Boolean(requireShipping),
    });
  }

  async _onApprove(paypalCheckout, data, _actions) {
    const { require: { shipping: requireShipping = true } = {} } = this.params;
    const { details, nonce } = await paypalCheckout.tokenizePayment(data);
    const { email, countryCode, firstName, lastName } = details;

    await this.updateCart({
      account: {
        email: email,
      },
      billing: {
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        country: countryCode,
        method: 'paypal',
        paypal: {
          nonce,
        },
      },
      ...(requireShipping && {
        shipping: {
          name: details.shippingAddress.recipientName,
          ...this._mapAddress(details.shippingAddress),
        },
      }),
    });

    this.onSuccess();
  }

  _mapAddress(address) {
    return {
      address1: address.line1,
      address2: address.line2,
      state: address.state,
      city: address.city,
      zip: address.postalCode,
      country: address.countryCode,
    };
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
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(api, options, params, methods.google);
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

  async createElements(cart) {
    const {
      elementId = 'googlepay-button',
      locale = 'en',
      style: { color = 'black', type = 'buy', sizeMode = 'fill' } = {},
    } = this.params;

    if (!this.method.merchant_id) {
      throw new Error('Google merchant ID is not defined');
    }

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

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
    const paymentRequestData = this._createPaymentRequestData(cart);
    const paymentDataRequest =
      googlePayment.createPaymentDataRequest(paymentRequestData);

    this.element = this.googleClient.createButton({
      buttonColor: color,
      buttonType: type,
      buttonSizeMode: sizeMode,
      buttonLocale: locale,
      onClick: this._onClick.bind(this, googlePayment, paymentDataRequest),
    });
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    container.appendChild(this.element);

    if (classes.base) {
      container.classList.add(classes.base);
    }
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

  async _onClick(googlePayment, paymentDataRequest) {
    try {
      const paymentData =
        await this.googleClient.loadPaymentData(paymentDataRequest);

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
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(api, options, params, methods.apple);
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

  async createElements(cart) {
    const { elementId = 'applepay-button' } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

    if (!this.ApplePaySession.canMakePayments()) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    const braintreeClient = await this._createBraintreeClient();
    const applePayment = await this.braintree.applePay.create({
      client: braintreeClient,
    });
    const paymentRequest = await this._createPaymentRequest(cart, applePayment);

    this.element = this._createButton(applePayment, paymentRequest);
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    container.appendChild(this.element);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  _createButton(applePayment, paymentRequest) {
    const { style: { type = 'plain', theme = 'black', height = '40px' } = {} } =
      this.params;

    const button = document.createElement('div');

    button.style.appearance = '-apple-pay-button';
    button.style['-apple-pay-button-type'] = type;
    button.style['-apple-pay-button-style'] = theme;
    button.style.height = height;

    button.addEventListener(
      'click',
      this._createPaymentSession.bind(this, applePayment, paymentRequest),
    );

    return button;
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
  constructor(api, options, params, methods) {
    super(api, options, params, methods.card);
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
  constructor(api, options, params, methods) {
    super(api, options, params, methods.paysafecard);
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
  constructor(api, options, params, methods) {
    super(api, options, params, methods.klarna);
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
  constructor(api, options, params, methods) {
    super(api, options, params, methods.paypal);
  }

  get scripts() {
    const { client_id } = this.method;

    return [
      {
        id: 'paypal-sdk',
        params: {
          client_id,
          merchant_id: this.merchantId,
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

  get merchantId() {
    const { mode, ppcp } = this.method;

    return ppcp ? this.method[`${mode}_merchant_id`] : this.method.merchant_id;
  }

  get returnUrl() {
    return `${
      window.location.origin + window.location.pathname
    }?gateway=paypal`;
  }

  async createElements(cart) {
    const {
      elementId = 'paypal-button',
      locale = 'en_US',
      style: {
        layout = 'horizontal',
        height = 45,
        color = 'gold',
        shape = 'rect',
        label = 'paypal',
        tagline = false,
      } = {},
    } = this.params;

    this.setElementContainer(elementId);

    this._validateCart(cart);
    await this.loadScripts(this.scripts);

    this.element = this.paypal.Buttons({
      locale,
      style: {
        layout,
        height,
        color,
        shape,
        label,
        tagline,
      },
      createOrder: this._onCreateOrder.bind(this, cart),
      onShippingChange: this._onShippingChange.bind(this),
      onApprove: this._onApprove.bind(this),
      onError: this.onError.bind(this),
    });
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    this.element.render(`#${container.id}`);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  _validateCart(cart) {
    const hasSubscriptionProduct = Boolean(cart.subscription_delivery);

    if (hasSubscriptionProduct && !this.method.ppcp) {
      throw new Error(
        'Subscriptions are only supported by PayPal Commerce Platform. See Payment settings in the Swell dashboard to enable PayPal Commerce Platform',
      );
    }

    if (!(cart.capture_total > 0)) {
      throw new Error(
        'Invalid PayPal button amount. Value should be greater than zero.',
      );
    }
  }

  async _onCreateOrder(cart, _data, _actions) {
    const { require: { shipping: requireShipping = true } = {} } = this.params;
    const { capture_total, currency, subscription_delivery } = cart;
    const hasSubscriptionProduct = Boolean(subscription_delivery);
    const merchantId = this.merchantId;
    const returnUrl = this.returnUrl;
    const orderData = {
      application_context: {
        shipping_preference: requireShipping ? 'GET_FROM_FILE' : 'NO_SHIPPING',
      },
    };
    const purchaseUnit = {
      amount: {
        value: Number(capture_total.toFixed(2)),
        currency_code: currency,
      },
    };

    if (merchantId) {
      // express checkout and ppcp
      orderData.intent = 'AUTHORIZE';
      purchaseUnit.payee = {
        merchant_id: merchantId,
      };

      if (hasSubscriptionProduct) {
        orderData.payment_source = {
          paypal: {
            attributes: {
              vault: {
                store_in_vault: 'ON_SUCCESS',
                usage_type: 'MERCHANT',
              },
            },
            experience_context: {
              return_url: `${returnUrl}&redirect_status=succeeded`,
              cancel_url: `${returnUrl}&redirect_status=canceled`,
            },
          },
        };
      }
    } else {
      // progressive checkout
      orderData.intent = 'CAPTURE';
      purchaseUnit.payee = {
        email_address: this.method.store_owner_email,
      };
    }

    orderData.purchase_units = [purchaseUnit];

    const order = await this.createIntent({
      gateway: 'paypal',
      intent: orderData,
    });

    return order.id;
  }

  async _onShippingChange(data, actions) {
    try {
      const { orderID, shipping_address, selected_shipping_option } = data;
      const updateData = {
        shipping: {
          state: shipping_address.state,
          city: shipping_address.city,
          zip: shipping_address.postal_code,
          country: shipping_address.country_code,
        },
        shipment_rating: null,
      };

      if (selected_shipping_option) {
        updateData.shipping.service = selected_shipping_option.id;
        updateData.$taxes = true;
      }

      const cart = await this.updateCart(updateData);
      const shippingServices = get(cart, 'shipment_rating.services');

      // can't fulfill shipping to selected address
      if (isEmpty(shippingServices)) {
        return actions.reject();
      }

      let selectedShippingService;

      if (selected_shipping_option) {
        selectedShippingService = shippingServices.find(
          (shippingService) =>
            shippingService.id === selected_shipping_option.id,
        );
      }

      // need to set first service for cart by default
      if (!selectedShippingService) {
        const [firstShippingService] = shippingServices;

        await this.updateCart({
          shipping: {
            service: firstShippingService.id,
          },
          $taxes: true,
        });
      }

      await this.updateIntent({
        gateway: 'paypal',
        intent: {
          cart_id: cart.id,
          paypal_order_id: orderID,
        },
      });

      return orderID;
    } catch (error) {
      this.onError(error);

      return actions.reject();
    }
  }

  async _onApprove(data, actions) {
    const { require: { shipping: requireShipping = true } = {} } = this.params;
    const order = await actions.order.get();
    const orderId = order.id;
    const payer = order.payer;
    const billing = payer.address;
    const shipping = get(order, 'purchase_units[0].shipping');
    const name = `${payer.name.given_name} ${payer.name.surname}`;

    await this.updateCart({
      account: {
        email: payer.email_address,
      },
      billing: {
        method: 'paypal',
        paypal: {
          order_id: orderId,
        },
        name,
        ...this._mapAddress(billing),
      },
      ...(requireShipping && {
        shipping: {
          first_name: payer.name.given_name,
          last_name: payer.name.surname,
          name: shipping.name.full_name,
          ...this._mapAddress(shipping.address),
        },
      }),
    });

    this.onSuccess();
  }

  _mapAddress(address) {
    return {
      address1: address.address_line_1,
      address2: address.address_line_2,
      state: address.admin_area_1,
      city: address.admin_area_2,
      zip: address.postal_code,
      country: address.country_code,
    };
  }
}

class AmazonDirectPayment extends Payment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods.amazon);
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

  async createElements(cart) {
    const {
      elementId = 'amazonpay-button',
      locale = 'en_US',
      placement = 'Checkout',
      style: { color = 'Gold' } = {},
      require: { shipping: requireShipping } = {},
    } = this.params;

    this.setElementContainer(elementId);

    const session = await this._createSession(cart);

    await this.loadScripts(this.scripts);

    this.element = {
      ledgerCurrency: cart.currency,
      checkoutLanguage: locale,
      productType: requireShipping ? 'PayAndShip' : 'PayOnly',
      buttonColor: color,
      placement,
      merchantId: this.merchantId,
      publicKeyId: this.publicKeyId,
      createCheckoutSessionConfig: {
        payloadJSON: session.payload,
        signature: session.signature,
      },
    };
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;
    const amazon = this.amazon;

    amazon.Pay.renderButton(`#${container.id}`, this.element);

    if (classes.base) {
      container.classList.add(classes.base);
    }
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

  _createSession(cart) {
    const returnUrl = this.returnUrl;
    const isSubscription = Boolean(cart.subscription_delivery);

    return this.authorizeGateway({
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

function adjustConfig(params) {
  if (!params.config) {
    return;
  }

  if (params.card) {
    console.warn('Please move the "config" field to the "card.config"');

    params.card.config = params.config;
  }

  if (params.ideal) {
    console.warn('Please move the "config" field to the "ideal.config"');

    params.ideal.config = params.config;
  }

  delete params.config;
}

function adjustElementId(methodParams) {
  if (methodParams.cardNumber) {
    adjustElementId(methodParams.cardNumber);
  }

  if (methodParams.cardExpiry) {
    adjustElementId(methodParams.cardExpiry);
  }

  if (methodParams.cardCvc) {
    adjustElementId(methodParams.cardCvc);
  }

  if (!methodParams.elementId) {
    return;
  }

  if (methodParams.elementId.startsWith('#')) {
    console.warn(
      `Please remove the "#" sign from the "${methodParams.elementId}" element ID`,
    );

    methodParams.elementId = methodParams.elementId.substring(1);
  }
}

function adjustParams(_params) {
  const params = { ..._params };

  adjustConfig(params);

  return params;
}

function adjustMethodParams(_methodParams) {
  const methodParams = { ..._methodParams };

  adjustElementId(methodParams);

  return methodParams;
}

class PaymentController {
  constructor(api, options) {
    this.api = api;
    this.options = options;
    this.payment = new Payment(this.api, this.options);
  }

  get(id) {
    return this.api.request('get', '/payments', id);
  }

  async methods() {
    if (this.methodSettings) {
      return this.methodSettings;
    }

    this.methodSettings = await this.api.request('get', '/payment/methods');

    return this.methodSettings;
  }

  async createElements(params) {
    this.params = params;

    if (!params) {
      throw new Error('Payment element parameters are not provided');
    }

    const paymentInstances = await this._createPaymentInstances();
    const cart = await this.payment.getCart();

    await this._performPaymentAction(
      paymentInstances,
      'createElements',
      cart,
    ).then((paymentInstances) =>
      this._performPaymentAction(paymentInstances, 'mountElements'),
    );
  }

  async tokenize(params = this.params) {
    this.params = params;

    if (!this.params) {
      throw new Error('Tokenization parameters are not provided');
    }

    const paymentInstances = await this._createPaymentInstances();

    await this._performPaymentAction(paymentInstances, 'tokenize');
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

    const paymentInstances = await this._createPaymentInstances();

    await this._performPaymentAction(
      paymentInstances,
      'handleRedirect',
      queryParams,
    );
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
        this.api,
        this.options,
        null,
        paymentMethods,
      );

      await paymentInstance.loadScripts(paymentInstance.scripts);

      const result = await paymentInstance.authenticate(payment);

      return result;
    } catch (error) {
      return { error };
    }
  }

  /**
   * Reset the payment timer to update the payment status faster
   *
   * @param {string} id
   * @returns {Promise<object>}
   */
  resetAsyncPayment(id) {
    return this.payment.resetAsyncPayment(id);
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

  async _getPaymentMethods() {
    const paymentMethods = await methods$1(this.api, this.options).payments();

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

  async _createPaymentInstances() {
    const paymentMethods = await this._getPaymentMethods();
    const params = adjustParams(this.params);

    return Object.entries(params).reduce((acc, [method, params]) => {
      const methodSettings = paymentMethods[method];

      if (!methodSettings) {
        console.error(new PaymentMethodDisabledError(method));

        return acc;
      }

      const PaymentClass = this._getPaymentClass(
        method,
        methodSettings.gateway,
      );

      if (!PaymentClass) {
        console.error(
          new UnsupportedPaymentMethodError(method, methodSettings.gateway),
        );

        return acc;
      }

      const methodParams = adjustMethodParams(params);

      try {
        const paymentInstance = new PaymentClass(
          this.api,
          this.options,
          methodParams,
          paymentMethods,
        );

        acc.push(paymentInstance);
      } catch (error) {
        console.error(error);
      }

      return acc;
    }, []);
  }

  async _performPaymentAction(paymentInstances, action, ...args) {
    const actions = paymentInstances.reduce((acc, instance) => {
      const paymentAction = instance[action];

      if (paymentAction) {
        acc.set(instance, paymentAction.call(instance, ...args));
      }

      return acc;
    }, new Map());

    await Promise.allSettled(actions.values());

    const nextPaymentInstances = [];

    for (const [instance, resultPromise] of actions.entries()) {
      try {
        await resultPromise;
        nextPaymentInstances.push(instance);
      } catch (error) {
        const onPaymentError = instance.onError.bind(instance);

        onPaymentError(error);
      }
    }

    return nextPaymentInstances;
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

export { PaymentController as default };
