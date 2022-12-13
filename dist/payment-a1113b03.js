import get from 'lodash/get';
import toLower from 'lodash/toLower';
import { m as methods$1 } from './cart-0249dad3.js';
import { m as methods$2 } from './settings-3a746fb9.js';
import { b as toSnake, v as vaultRequest, j as isFunction, o as getLocationParams, p as removeUrlParams } from './index-b1ee0b3d.js';
import reduce from 'lodash/reduce';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import toNumber from 'lodash/toNumber';

var __defProp$2 = Object.defineProperty;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$2(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$2(a, prop, b[prop]);
    }
  return a;
};
const addressFieldsMap$1 = {
  city: "city",
  country: "country",
  line1: "address1",
  line2: "address2",
  postal_code: "zip",
  state: "state"
};
const billingFieldsMap = {
  name: "name",
  phone: "phone"
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
  const details = __spreadValues$2({}, mapValues(billingFieldsMap, cart.billing));
  if (cart.account && cart.account.email) {
    details.email = cart.account.email;
  }
  const address = mapValues(addressFieldsMap$1, cart.billing);
  if (!isEmpty(address)) {
    details.address = address;
  }
  return details;
}
function getKlarnaItems(cart) {
  const currency = toLower(get(cart, "currency", "eur"));
  const items = map(cart.items, (item) => ({
    type: "sku",
    description: item.product.name,
    quantity: item.quantity,
    currency,
    amount: Math.round(toNumber(item.price_total - item.discount_total) * 100)
  }));
  const tax = get(cart, "tax_included_total");
  if (tax) {
    items.push({
      type: "tax",
      description: "Taxes",
      currency,
      amount: Math.round(toNumber(tax) * 100)
    });
  }
  const shipping = get(cart, "shipping", {});
  const shippingTotal = get(cart, "shipment_total", {});
  if (shipping.price) {
    items.push({
      type: "shipping",
      description: shipping.service_name,
      currency,
      amount: Math.round(toNumber(shippingTotal) * 100)
    });
  }
  return items;
}
function setKlarnaBillingShipping(source, data) {
  const shippingNameFieldsMap = {
    shipping_first_name: "first_name",
    shipping_last_name: "last_name"
  };
  const shippingFieldsMap = {
    phone: "phone"
  };
  const billingNameFieldsMap = {
    first_name: "first_name",
    last_name: "last_name"
  };
  const billingFieldsMap2 = {
    email: "email"
  };
  const fillValues = (fieldsMap, data2) => reduce(
    fieldsMap,
    (acc, srcKey, destKey) => {
      const value = data2[srcKey];
      if (value) {
        acc[destKey] = value;
      }
      return acc;
    },
    {}
  );
  source.klarna = __spreadValues$2(__spreadValues$2({}, source.klarna), fillValues(shippingNameFieldsMap, data.shipping));
  const shipping = fillValues(shippingFieldsMap, data.shipping);
  const shippingAddress = fillValues(addressFieldsMap$1, data.shipping);
  if (shipping || shippingAddress) {
    source.source_order.shipping = __spreadValues$2(__spreadValues$2({}, shipping ? shipping : {}), shippingAddress ? { address: shippingAddress } : {});
  }
  source.klarna = __spreadValues$2(__spreadValues$2({}, source.klarna), fillValues(
    billingNameFieldsMap,
    data.billing || get(data, "account.billing") || data.shipping
  ));
  const billing = fillValues(billingFieldsMap2, data.account);
  const billingAddress = fillValues(
    addressFieldsMap$1,
    data.billing || get(data, "account.billing") || data.shipping
  );
  if (billing || billingAddress) {
    source.owner = __spreadValues$2(__spreadValues$2({}, billing ? billing : {}), billingAddress ? { address: billingAddress } : {});
  }
}
function setBancontactOwner(source, data) {
  const fillValues = (fieldsMap, data2) => reduce(
    fieldsMap,
    (acc, srcKey, destKey) => {
      const value = data2[srcKey];
      if (value) {
        acc[destKey] = value;
      }
      return acc;
    },
    {}
  );
  const { account = {}, billing, shipping } = data;
  const billingData = __spreadValues$2(__spreadValues$2(__spreadValues$2(__spreadValues$2({}, account.shipping), account.billing), shipping), billing);
  const billingAddress = fillValues(addressFieldsMap$1, billingData);
  source.owner = __spreadValues$2(__spreadValues$2({
    email: account.email,
    name: billingData.name || account.name
  }, billingData.phone ? { phone: billingData.phone } : account.phone ? { phone: account.phone } : {}), !isEmpty(billingAddress) ? { address: billingAddress } : {});
}
async function createPaymentMethod(stripe, cardElement, authorize, cart) {
  const billingDetails = getBillingDetails(cart);
  const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod(__spreadValues$2({
    type: "card",
    card: cardElement
  }, !isEmpty(billingDetails) ? { billing_details: billingDetails } : {}));
  if (paymentMethodError) {
    return { error: paymentMethodError };
  }
  const customer = cart.account && cart.account.stripe_customer;
  const authorization = await authorize({
    gateway: "stripe",
    params: __spreadValues$2({
      usage: "off_session",
      payment_method: paymentMethod.id
    }, customer ? { customer } : {})
  });
  if (!authorization) {
    return;
  }
  const { error: setupIntentError } = await stripe.confirmCardSetup(
    authorization.client_secret
  );
  return setupIntentError ? { error: setupIntentError } : authorization.card;
}
async function createIDealPaymentMethod(stripe, element, cart) {
  const billingDetails = getBillingDetails(cart);
  return await stripe.createPaymentMethod(__spreadValues$2({
    type: "ideal",
    ideal: element
  }, billingDetails ? { billing_details: billingDetails } : {}));
}
async function createKlarnaSource(stripe, cart) {
  const sourceObject = {
    type: "klarna",
    flow: "redirect",
    amount: Math.round(get(cart, "grand_total", 0) * 100),
    currency: toLower(get(cart, "currency", "eur")),
    klarna: {
      product: "payment",
      purchase_country: get(cart, "settings.country", "DE")
    },
    source_order: {
      items: getKlarnaItems(cart)
    },
    redirect: {
      return_url: window.location.href
    }
  };
  setKlarnaBillingShipping(sourceObject, cart);
  return await stripe.createSource(sourceObject);
}
async function createBancontactSource(stripe, cart) {
  const sourceObject = {
    type: "bancontact",
    amount: Math.round(get(cart, "grand_total", 0) * 100),
    currency: toLower(get(cart, "currency", "eur")),
    redirect: {
      return_url: window.location.href
    }
  };
  setBancontactOwner(sourceObject, cart);
  return await stripe.createSource(sourceObject);
}
function stripeAmountByCurrency(currency, amount) {
  const zeroDecimalCurrencies = [
    "BIF",
    "DJF",
    "JPY",
    "KRW",
    "PYG",
    "VND",
    "XAF",
    "XPF",
    "CLP",
    "GNF",
    "KMF",
    "MGA",
    "RWF",
    "VUV",
    "XOF"
  ];
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return amount;
  } else {
    return Math.round(amount * 100);
  }
}

function generateOrderId() {
  return Math.random().toString(36).substr(2, 9);
}
async function createQuickpayCard(authorize) {
  const returnUrl = window.location.origin + window.location.pathname;
  const authorization = await authorize({
    gateway: "quickpay",
    params: {
      action: "create",
      continueurl: `${returnUrl}?gateway=quickpay&redirect_status=succeeded`,
      cancelurl: `${returnUrl}?gateway=quickpay&redirect_status=canceled`
    }
  });
  if (authorization && authorization.url) {
    window.location.replace(authorization.url);
  }
}
async function getQuickpayCardDetais(id, authorize) {
  return await authorize({
    gateway: "quickpay",
    params: { action: "get", id }
  });
}
async function createQuickpayPayment(cart, createIntent) {
  return await createIntent({
    gateway: "quickpay",
    intent: {
      currency: get(cart, "currency", "USD"),
      order_id: generateOrderId()
    }
  });
}

async function createPaysafecardPayment(cart, createIntent) {
  const returnUrl = window.location.origin + window.location.pathname;
  const url = `${returnUrl}?gateway=paysafecard`;
  return await createIntent({
    gateway: "paysafecard",
    intent: {
      type: "PAYSAFECARD",
      amount: cart.grand_total,
      redirect: {
        success_url: url,
        failure_url: url
      },
      notification_url: url,
      customer: {
        id: get(cart, "account.id")
      },
      currency: get(cart, "currency", "USD")
    }
  });
}

var __defProp$1 = Object.defineProperty;
var __defProps$1 = Object.defineProperties;
var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
const addressFieldsMap = {
  given_name: "first_name",
  family_name: "last_name",
  city: "city",
  country: "country",
  phone: "phone",
  postal_code: "zip",
  street_address: "address1",
  street_address2: "address2",
  region: "state"
};
const mapFields = (fieldsMap, data) => reduce(
  fieldsMap,
  (acc, srcKey, destKey) => {
    const value = data[srcKey];
    if (value) {
      acc[destKey] = value;
    }
    return acc;
  },
  {}
);
const mapAddressFields = (cart, addressField) => __spreadProps$1(__spreadValues$1({}, mapFields(addressFieldsMap, cart[addressField])), {
  email: get(cart, "account.email")
});
function getOrderLines(cart) {
  const items = map(cart.items, (item) => ({
    type: "physical",
    name: get(item, "product.name"),
    reference: get(item, "product.sku") || get(item, "product.slug"),
    quantity: item.quantity,
    unit_price: Math.round(toNumber(item.price - item.discount_each) * 100),
    total_amount: Math.round(
      toNumber(item.price_total - item.discount_total) * 100
    ),
    tax_rate: 0,
    total_tax_amount: 0
  }));
  const tax = get(cart, "tax_included_total");
  const taxAmount = toNumber(tax) * 100;
  if (tax) {
    items.push({
      type: "sales_tax",
      name: "Taxes",
      quantity: 1,
      unit_price: taxAmount,
      total_amount: taxAmount,
      tax_rate: 0,
      total_tax_amount: 0
    });
  }
  const shipping = get(cart, "shipping", {});
  const shippingTotal = get(cart, "shipment_total", {});
  const shippingAmount = toNumber(shippingTotal) * 100;
  if (shipping.price) {
    items.push({
      type: "shipping_fee",
      name: shipping.service_name,
      quantity: 1,
      unit_price: shippingAmount,
      total_amount: shippingAmount,
      tax_rate: 0,
      total_tax_amount: 0
    });
  }
  return items;
}
async function createKlarnaSession(cart, createIntent) {
  const returnUrl = `${window.location.origin}${window.location.pathname}?gateway=klarna_direct&sid={{session_id}}`;
  const successUrl = `${returnUrl}&authorization_token={{authorization_token}}`;
  return createIntent({
    gateway: "klarna",
    intent: {
      locale: cart.display_locale || get(cart, "settings.locale") || "en-US",
      purchase_country: get(cart, "billing.country") || get(cart, "shipping.country"),
      purchase_currency: cart.currency,
      billing_address: mapAddressFields(cart, "billing"),
      shipping_address: mapAddressFields(cart, "shipping"),
      order_amount: Math.round(get(cart, "grand_total", 0) * 100),
      order_lines: JSON.stringify(getOrderLines(cart)),
      merchant_urls: {
        success: successUrl,
        back: returnUrl,
        cancel: returnUrl,
        error: returnUrl,
        failure: returnUrl
      }
    }
  });
}

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
      return request("get", "/payments", id);
    },
    async methods() {
      if (this.methodSettings) {
        return this.methodSettings;
      }
      const result = await request("get", "/payment/methods");
      return this.methodSettings = result;
    },
    async createElements(elementParams) {
      this.params = elementParams || {};
      const cart = toSnake(await methods$1(request, options).get());
      if (!cart) {
        throw new Error("Cart not found");
      }
      const payMethods = toSnake(
        await methods$2(request, options).payments()
      );
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      await render(request, cart, payMethods, this.params);
    },
    async tokenize(params) {
      const cart = toSnake(await methods$1(request, options).get());
      if (!cart) {
        throw new Error("Cart not found");
      }
      const payMethods = toSnake(
        await methods$2(request, options).payments()
      );
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      return await paymentTokenize(
        request,
        params || this.params,
        payMethods,
        cart
      );
    },
    async handleRedirect(params) {
      const cart = toSnake(await methods$1(request, options).get());
      if (!cart) {
        throw new Error("Cart not found");
      }
      return await handleRedirect(request, params || this.params, cart);
    },
    async authenticate(id) {
      const payment = await this.get(id);
      if (!payment) {
        throw new Error("Payment not found");
      }
      const payMethods = toSnake(
        await methods$2(request, options).payments()
      );
      if (payMethods.error) {
        throw new Error(payMethods.error);
      }
      return await authenticate(request, payment, payMethods);
    },
    async createIntent(data) {
      const intent = await vaultRequest("post", "/intent", data);
      if (intent.errors) {
        const param = Object.keys(intent.errors)[0];
        const err = new Error(intent.errors[param].message || "Unknown error");
        err.code = "vault_error";
        err.status = 402;
        err.param = param;
        throw err;
      }
      return intent;
    },
    async updateIntent(data) {
      const intent = await vaultRequest("put", "/intent", data);
      if (intent.errors) {
        const param = Object.keys(intent.errors)[0];
        const err = new Error(intent.errors[param].message || "Unknown error");
        err.code = "vault_error";
        err.status = 402;
        err.param = param;
        throw err;
      }
      return intent;
    },
    async authorizeGateway(data) {
      const authorization = await vaultRequest("post", "/authorization", data);
      if (authorization.errors) {
        const param = Object.keys(authorization.errors)[0];
        const err = new Error(
          authorization.errors[param].message || "Unknown error"
        );
        err.code = "vault_error";
        err.status = 402;
        err.param = param;
        throw err;
      }
      return authorization;
    }
  };
}
async function render(request, cart, payMethods, params) {
  if (params.card) {
    if (!payMethods.card) {
      console.error(
        `Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.`
      );
    } else if (payMethods.card.gateway === "braintree") {
      if (!window.braintree) {
        await loadScript(
          "braintree-web",
          "https://js.braintreegateway.com/web/3.57.0/js/client.min.js"
        );
      }
    } else if (payMethods.card.gateway === "stripe") {
      if (!window.Stripe) {
        await loadScript("stripe-js", "https://js.stripe.com/v3/");
      }
      await stripeElements(request, payMethods, params);
    }
  }
  if (params.ideal) {
    if (!payMethods.card) {
      console.error(
        `Payment element error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.`
      );
    } else if (!payMethods.ideal) {
      console.error(
        `Payment element error: iDEAL payments are disabled. See Payment settings in the Swell dashboard for details.`
      );
    } else if (payMethods.card.gateway === "stripe") {
      if (!window.Stripe) {
        await loadScript("stripe-js", "https://js.stripe.com/v3/");
      }
      await stripeElements(request, payMethods, params);
    }
  }
  if (params.paypal) {
    if (!payMethods.paypal) {
      console.error(
        `Payment element error: PayPal payments are disabled. See Payment settings in the Swell dashboard for details.`
      );
    } else if (payMethods.card && payMethods.card.gateway === "braintree" && payMethods.paypal.gateway === "braintree") {
      if (!window.paypal) {
        await loadScript(
          "paypal-sdk",
          `https://www.paypal.com/sdk/js?currency=${cart.currency}&client-id=${payMethods.paypal.client_id}&merchant-id=${payMethods.paypal.merchant_id}&vault=true`
        );
      }
      if (!window.braintree) {
        await loadScript(
          "braintree-web",
          "https://js.braintreegateway.com/web/3.57.0/js/client.min.js"
        );
      }
      if (window.braintree && !window.braintree.paypalCheckout) {
        await loadScript(
          "braintree-web-paypal-checkout",
          "https://js.braintreegateway.com/web/3.57.0/js/paypal-checkout.min.js"
        );
      }
      await braintreePayPalButton(request, cart, payMethods, params);
    } else {
      if (!window.paypal) {
        await loadScript(
          "paypal-sdk",
          `https://www.paypal.com/sdk/js?currency=${cart.currency}&client-id=${payMethods.paypal.client_id}&merchant-id=${payMethods.paypal.merchant_id}&intent=authorize&commit=false`
        );
      }
      await payPalButton(request, cart, payMethods, params);
    }
  }
}
const loadScript = async (id, src) => {
  LOADING_SCRIPTS[id] = LOADING_SCRIPTS[id] || new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.type = "text/javascript";
    script.addEventListener(
      "load",
      () => {
        resolve();
        LOADING_SCRIPTS[id] = null;
      },
      {
        once: true
      }
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
    const elementParams = get(params, `card[${type}]`) || params.card || params.ideal;
    const elementOptions = elementParams.options || {};
    const element = elements.create(type, elementOptions);
    element.mount(elementParams.elementId || `#${type}-element`);
    elementParams.onChange && element.on("change", elementParams.onChange);
    elementParams.onReady && element.on("ready", elementParams.onReady);
    elementParams.onFocus && element.on("focus", elementParams.onFocus);
    elementParams.onBlur && element.on("blur", elementParams.onBlur);
    elementParams.onEscape && element.on("escape", elementParams.onEscape);
    elementParams.onClick && element.on("click", elementParams.onClick);
    if (type === "card" || type === "cardNumber" || type === "idealBank") {
      CARD_ELEMENTS.stripe = element;
    }
  };
  API.stripe = stripe;
  if (params.ideal) {
    createElement("idealBank");
  } else if (params.card.separateElements) {
    createElement("cardNumber");
    createElement("cardExpiry");
    createElement("cardCvc");
  } else {
    createElement("card");
  }
}
async function shouldUsePayPalEmail(guest, request, options2) {
  if (!guest)
    return false;
  const updatedCart = await methods$1(request, options2).get();
  const currentEmail = get(updatedCart, "account.email");
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
    const errorHandler = get(params, "paypal.onError");
    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }
    throw new Error(error.message);
  };
  const onSuccess = () => {
    const successHandler = get(params, "paypal.onSuccess");
    return isFunction(successHandler) && successHandler();
  };
  if (!(capture_total > 0)) {
    throw new Error(
      "Invalid PayPal button amount. Value should be greater than zero."
    );
  }
  paypal.Buttons(
    {
      locale: locale || "en_US",
      style: style || {
        layout: "horizontal",
        height: 45,
        color: "gold",
        shape: "rect",
        label: "paypal",
        tagline: false
      },
      createOrder: (data, actions) => actions.order.create({
        intent: "AUTHORIZE",
        purchase_units: [
          {
            amount: {
              value: +capture_total.toFixed(2),
              currency_code: currency
            }
          }
        ]
      }),
      onApprove: (data, actions) => actions.order.get().then(async (order) => {
        const orderId = order.id;
        const payer = order.payer;
        const shipping = get(order, "purchase_units[0].shipping");
        const usePayPalEmail = await shouldUsePayPalEmail(
          guest,
          request,
          options
        );
        return methods$1(request).update(__spreadProps(__spreadValues({}, usePayPalEmail && {
          account: {
            email: payer.email_address
          }
        }), {
          billing: {
            method: "paypal",
            paypal: { order_id: orderId }
          },
          shipping: {
            name: shipping.name.full_name,
            address1: shipping.address.address_line_1,
            address2: shipping.address.address_line_2,
            state: shipping.address.admin_area_1,
            city: shipping.address.admin_area_2,
            zip: shipping.address.postal_code,
            country: shipping.address.country_code
          }
        }));
      }).then(onSuccess).catch(onError)
    },
    onError
  ).render(elementId || "#paypal-button");
}
async function braintreePayPalButton(request, cart, payMethods, params) {
  const authorization = await vaultRequest("post", "/authorization", {
    gateway: "braintree"
  });
  if (authorization.error) {
    throw new Error(authorization.error);
  }
  const braintree = window.braintree;
  const paypal = window.paypal;
  braintree.client.create({
    authorization
  }).then(
    (client) => braintree.paypalCheckout.create({
      client
    })
  ).then((paypalCheckoutInstance) => {
    return paypal.Buttons({
      style: params.paypal.style || {},
      createBillingAgreement: () => paypalCheckoutInstance.createPayment({
        flow: "vault",
        currency: cart.currency,
        amount: cart.grand_total
      }),
      onApprove: (data, actions) => paypalCheckoutInstance.tokenizePayment(data).then(
        ({ nonce }) => methods$1(request, options).update({
          billing: { paypal: { nonce } }
        })
      ).then(
        () => isFunction(params.paypal.onSuccess) && params.paypal.onSuccess(data, actions)
      ).catch(
        isFunction(params.paypal.onError) ? params.paypal.onError : (err) => console.error("PayPal error", err)
      ),
      onCancel: isFunction(params.paypal.onCancel) ? () => params.paypal.onCancel() : () => console.log("PayPal payment cancelled"),
      onError: isFunction(params.paypal.onError) ? (err) => params.paypal.onError(err) : (err) => console.error("PayPal error", err)
    }).render(params.paypal.elementId || "#paypal-button");
  }).catch(
    isFunction(params.paypal.onError) ? params.paypal.onError : (err) => console.error("PayPal error", err)
  );
}
async function paymentTokenize(request, params, payMethods, cart) {
  const { capture_total, auth_total } = cart;
  const onError = (error) => {
    const errorHandler = get(params, "card.onError") || get(params, "ideal.onError") || get(params, "klarna.onError") || get(params, "bancontact.onError") || get(params, "paysafecard.onError");
    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }
    throw new Error(error.message);
  };
  const onSuccess = (result) => {
    const successHandler = get(params, "card.onSuccess") || get(params, "ideal.onSuccess");
    if (isFunction(successHandler)) {
      return successHandler(result);
    }
  };
  if (!params) {
    return onError({ message: "Tokenization parameters not passed" });
  }
  if (params.card && payMethods.card) {
    if (payMethods.card.gateway === "stripe" && CARD_ELEMENTS.stripe && API.stripe) {
      const stripe = API.stripe;
      const paymentMethod = await createPaymentMethod(
        stripe,
        CARD_ELEMENTS.stripe,
        methods(request).authorizeGateway,
        cart
      ).catch(onError);
      if (!paymentMethod) {
        return;
      } else if (paymentMethod.error) {
        return onError(paymentMethod.error);
      } else if (capture_total < 1) {
        return methods$1(request, options).update({
          billing: {
            method: "card",
            card: paymentMethod
          }
        }).then(onSuccess).catch(onError);
      }
      const currency = toLower(get(cart, "currency", "usd"));
      const amount = stripeAmountByCurrency(
        currency,
        capture_total + auth_total
      );
      const stripeCustomer = get(cart, "account.stripe_customer");
      const intent = toSnake(
        await methods(request).createIntent({
          gateway: "stripe",
          intent: __spreadValues({
            payment_method: paymentMethod.token,
            amount,
            currency,
            capture_method: "manual",
            off_session: true,
            confirm: true
          }, stripeCustomer ? { customer: stripeCustomer } : {})
        }).catch(onError)
      );
      if (intent && intent.status === "requires_confirmation") {
        const { paymentIntent, error } = await stripe.confirmCardPayment(
          intent.client_secret
        );
        return error ? onError(error) : await methods$1(request, options).update({
          billing: {
            method: "card",
            card: paymentMethod,
            intent: {
              stripe: __spreadValues({
                id: paymentIntent.id
              }, !!auth_total && {
                auth_amount: auth_total
              })
            }
          }
        }).then(onSuccess).catch(onError);
      }
    } else if (payMethods.card.gateway === "quickpay") {
      const intent = await createQuickpayPayment(
        cart,
        methods(request).createIntent
      ).catch(onError);
      if (!intent) {
        return;
      } else if (intent.error) {
        return onError(intent.error);
      }
      await methods$1(request, options).update({
        billing: {
          method: "card",
          intent: {
            quickpay: {
              id: intent
            }
          }
        }
      });
      createQuickpayCard(methods(request).authorizeGateway).catch(onError);
    }
  } else if (params.ideal && payMethods.ideal) {
    if (payMethods.card && payMethods.card.gateway === "stripe" && CARD_ELEMENTS.stripe && API.stripe) {
      const { error, paymentMethod } = await createIDealPaymentMethod(
        API.stripe,
        CARD_ELEMENTS.stripe,
        cart
      );
      if (error) {
        return onError(error);
      }
      const currency = toLower(get(cart, "currency", "eur"));
      const amount = stripeAmountByCurrency(currency, capture_total);
      const intent = toSnake(
        await methods(request).createIntent({
          gateway: "stripe",
          intent: {
            payment_method: paymentMethod.id,
            amount,
            currency,
            payment_method_types: "ideal",
            confirmation_method: "manual",
            confirm: true,
            return_url: window.location.href
          }
        }).catch(onError)
      );
      if (intent) {
        await methods$1(request, options).update({
          billing: {
            method: "ideal",
            ideal: {
              token: paymentMethod.id
            },
            intent: { stripe: { id: intent.id } }
          }
        }).catch(onError);
        return (intent.status === "requires_action" || intent.status === "requires_source_action") && await API.stripe.handleCardAction(intent.client_secret);
      }
    }
  } else if (params.klarna && payMethods.klarna) {
    if (payMethods.klarna.gateway === "klarna") {
      const session = await createKlarnaSession(
        cart,
        methods(request).createIntent
      ).catch(onError);
      return session && window.location.replace(session.redirect_url);
    } else if (payMethods.card && payMethods.card.gateway === "stripe") {
      if (!window.Stripe) {
        await loadScript("stripe-js", "https://js.stripe.com/v3/");
      }
      const { publishable_key } = payMethods.card;
      const stripe = window.Stripe(publishable_key);
      const settings = toSnake(await methods$2(request, options).get());
      const { error, source } = await createKlarnaSource(stripe, __spreadProps(__spreadValues({}, cart), {
        settings: settings.store
      }));
      return error ? onError(error) : methods$1(request, options).update({
        billing: {
          method: "klarna"
        }
      }).then(() => window.location.replace(source.redirect.url)).catch(onError);
    }
  } else if (params.bancontact && payMethods.bancontact) {
    if (payMethods.card && payMethods.card.gateway === "stripe") {
      if (!window.Stripe) {
        await loadScript("stripe-js", "https://js.stripe.com/v3/");
      }
      const { publishable_key } = payMethods.card;
      const stripe = window.Stripe(publishable_key);
      const { error, source } = await createBancontactSource(stripe, cart);
      return error ? onError(error) : methods$1(request, options).update({
        billing: {
          method: "bancontact"
        }
      }).then(() => window.location.replace(source.redirect.url)).catch(onError);
    }
  } else if (params.paysafecard && payMethods.paysafecard) {
    const intent = await createPaysafecardPayment(
      cart,
      methods(request).createIntent
    ).catch(onError);
    if (!intent) {
      return;
    }
    await methods$1(request, options).update({
      billing: {
        method: "paysafecard",
        intent: {
          paysafecard: {
            id: intent.id
          }
        }
      }
    });
    return window.location.replace(intent.redirect.auth_url);
  }
}
async function handleRedirect(request, params, cart) {
  const onError = (error) => {
    const errorHandler = get(params, "card.onError") || get(params, "paysafecard.onError") || get(params, "klarna.onError");
    if (isFunction(errorHandler)) {
      return errorHandler(error);
    }
    throw new Error(error.message);
  };
  const onSuccess = (result2) => {
    const successHandler = get(params, "card.onSuccess") || get(params, "paysafecard.onSuccess") || get(params, "klarna.onSuccess");
    if (isFunction(successHandler)) {
      return successHandler(result2);
    }
  };
  const queryParams = getLocationParams(window.location);
  removeUrlParams();
  const { gateway } = queryParams;
  let result;
  if (gateway === "quickpay") {
    result = await handleQuickpayRedirectAction(
      request,
      cart,
      params,
      queryParams
    );
  } else if (gateway === "paysafecard") {
    result = await handlePaysafecardRedirectAction(
      request,
      cart);
  } else if (gateway === "klarna_direct") {
    result = await handleDirectKlarnaRedirectAction(
      request,
      cart,
      params,
      queryParams
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
async function handleQuickpayRedirectAction(request, cart, params, queryParams) {
  const { redirect_status: status, card_id: id } = queryParams;
  switch (status) {
    case "succeeded":
      const card = await getQuickpayCardDetais(
        id,
        methods(request).authorizeGateway
      );
      if (!card) {
        return;
      } else if (card.error) {
        return card;
      } else {
        await methods$1(request, options).update({
          billing: {
            method: "card",
            card
          }
        });
        return { success: true };
      }
    case "canceled":
      return {
        error: {
          message: "We are unable to authenticate your payment method. Please choose a different payment method and try again."
        }
      };
    default:
      return { error: { message: `Unknown redirect status: ${status}.` } };
  }
}
async function handlePaysafecardRedirectAction(request, cart) {
  const paymentId = get(cart, "billing.intent.paysafecard.id");
  if (!paymentId) {
    return {
      error: {
        message: "Paysafecard payment ID not defined."
      }
    };
  }
  const intent = await methods(request).updateIntent({
    gateway: "paysafecard",
    intent: { payment_id: paymentId }
  });
  if (!intent) {
    return;
  }
  switch (intent.status) {
    case "AUTHORIZED":
      return { success: true };
    case "CANCELED_CUSTOMER":
      return {
        error: {
          message: "We are unable to authenticate your payment method. Please choose a different payment method and try again."
        }
      };
    default:
      return {
        error: { message: `Unknown redirect status: ${intent.status}.` }
      };
  }
}
async function handleDirectKlarnaRedirectAction(request, cart, params, queryParams) {
  const { authorization_token } = queryParams;
  if (!authorization_token) {
    return {
      error: {
        message: "We are unable to authenticate your payment method. Please choose a different payment method and try again."
      }
    };
  }
  await methods$1(request, options).update({
    billing: {
      method: "klarna",
      klarna: {
        token: authorization_token
      }
    }
  });
  return { success: true };
}
async function authenticate(request, payment, payMethods) {
  const { method, gateway } = payment;
  if (method === "card") {
    const cardMethod = payMethods.card;
    if (!cardMethod) {
      console.error(
        `Authenticate error: credit card payments are disabled. See Payment settings in the Swell dashboard for details.`
      );
    } else if (gateway === "stripe" && cardMethod.gateway === "stripe") {
      if (!window.Stripe) {
        await loadScript("stripe-js", "https://js.stripe.com/v3/");
      }
      return authenticateStripeCard(request, payment, payMethods);
    }
  }
}
async function authenticateStripeCard(request, payment, payMethods) {
  const { transaction_id: id, card: { token } = {} } = payment;
  const { publishable_key } = payMethods.card;
  const intent = await methods(request, options).updateIntent({
    gateway: "stripe",
    intent: { id, payment_method: token }
  }).catch((error) => ({
    error
  }));
  if (intent.error) {
    return intent;
  }
  const stripe = window.Stripe(publishable_key);
  const actionResult = await stripe.confirmCardPayment(intent.client_secret);
  return actionResult.error ? {
    error: {
      message: actionResult.error.message,
      code: actionResult.error.code
    }
  } : { status: actionResult.status };
}

export { methods as m, shouldUsePayPalEmail as s };
