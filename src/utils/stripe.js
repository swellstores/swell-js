import { get, reduce, toLower, isEmpty } from './index';

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

const addressFieldsMap = {
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

  const address = mapValues(addressFieldsMap, cart.billing);
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
  const billingAddress = fillValues(addressFieldsMap, billingData);

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

export {
  createElement,
  createPaymentMethod,
  createIDealPaymentMethod,
  getKlarnaIntentDetails,
  getKlarnaConfirmationDetails,
  createBancontactSource,
  getPaymentRequestData,
  stripeAmountByCurrency,
  isStripeChargeableAmount,
};
