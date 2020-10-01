const reduce = require('lodash/reduce');
const isEmpty = require('lodash/isEmpty');
const get = require('lodash/get');
const toLower = require('lodash/toLower');
const map = require('lodash/map');
const toNumber = require('lodash/toNumber');

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

function getBillingDetails(billing) {
  const fillValues = (fieldsMap) =>
    reduce(
      fieldsMap,
      (acc, value, key) => {
        const billingValue = billing[value];
        if (billingValue) {
          acc[key] = billingValue;
        }
        return acc;
      },
      {},
    );

  const billingDetails = fillValues(billingFieldsMap);
  if (!isEmpty(billingDetails)) {
    const address = fillValues(addressFieldsMap);
    return {
      ...billingDetails,
      ...(!isEmpty(address) ? { address } : {}),
    };
  }
}

function getKlarnaItems(cart) {
  const currency = toLower(get(cart, 'currency', 'eur'));
  const items = map(cart.items, (item) => ({
    type: 'sku',
    description: item.product.name,
    quantity: item.quantity,
    currency,
    amount: Math.round(toNumber(item.price_total - item.discount_total) * 100),
  }));

  const tax = get(cart, 'tax_included_total');
  if (tax) {
    items.push({
      type: 'tax',
      description: 'Taxes',
      currency,
      amount: toNumber(tax) * 100,
    });
  }

  const shipping = get(cart, 'shipping', {});
  const shippingTotal = get(cart, 'shipment_total', {});
  if (shipping.price) {
    items.push({
      type: 'shipping',
      description: shipping.service_name,
      currency,
      amount: toNumber(shippingTotal) * 100,
    });
  }

  return items;
}

function setKlarnaBillingShipping(source, data) {
  const shippingNameFieldsMap = {
    shipping_first_name: 'first_name',
    shipping_last_name: 'last_name',
  };
  const shippingFieldsMap = {
    phone: 'phone',
  };
  const billingNameFieldsMap = {
    first_name: 'first_name',
    last_name: 'last_name',
  };
  const billingFieldsMap = {
    email: 'email',
  };

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

  source.klarna = { ...source.klarna, ...fillValues(shippingNameFieldsMap, data.shipping) };
  const shipping = fillValues(shippingFieldsMap, data.shipping);
  const shippingAddress = fillValues(addressFieldsMap, data.shipping);
  if (shipping || shippingAddress) {
    source.source_order.shipping = {
      ...(shipping ? shipping : {}),
      ...(shippingAddress ? { address: shippingAddress } : {}),
    };
  }

  source.klarna = { ...source.klarna, ...fillValues(billingNameFieldsMap, data.billing) };
  const billing = fillValues(billingFieldsMap, data.account);
  const billingAddress = fillValues(addressFieldsMap, data.billing);
  if (billing || billingAddress) {
    source.owner = {
      ...(billing ? billing : {}),
      ...(billingAddress ? { address: billingAddress } : {}),
    };
  }
}

async function createPaymentMethod(stripe, cardElement, billing = {}) {
  const billingDetails = getBillingDetails(billing);
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    ...(billingDetails ? { billing_details: billingDetails } : {}),
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

async function createIDealPaymentMethod(stripe, element, billing = {}) {
  const billingDetails = getBillingDetails(billing);
  return await stripe.createPaymentMethod({
    type: 'ideal',
    ideal: element,
    ...(billingDetails ? { billing_details: billingDetails } : {}),
  });
}

async function createKlarnaSource(stripe, cart, billing) {
  const sourceObject = {
    type: 'klarna',
    flow: 'redirect',
    amount: Math.round(get(cart, 'grand_total', 0) * 100),
    currency: toLower(get(cart, 'currency', 'eur')),
    klarna: {
      product: 'payment',
      purchase_country: get(cart, 'settings.country', 'DE'),
    },
    source_order: {
      items: getKlarnaItems(cart),
    },
    redirect: {
      return_url: window.location.href,
    },
  };
  setKlarnaBillingShipping(sourceObject, { ...cart, billing });

  return await stripe.createSource(sourceObject);
}

module.exports = {
  createPaymentMethod,
  createIDealPaymentMethod,
  createKlarnaSource,
};
