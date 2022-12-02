import reduce from 'lodash/reduce';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import toLower from 'lodash/toLower';
import map from 'lodash/map';
import toNumber from 'lodash/toNumber';

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
      amount: Math.round(toNumber(tax) * 100),
    });
  }

  const shipping = get(cart, 'shipping', {});
  const shippingTotal = get(cart, 'shipment_total', {});
  if (shipping.price) {
    items.push({
      type: 'shipping',
      description: shipping.service_name,
      currency,
      amount: Math.round(toNumber(shippingTotal) * 100),
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

  source.klarna = {
    ...source.klarna,
    ...fillValues(shippingNameFieldsMap, data.shipping),
  };
  const shipping = fillValues(shippingFieldsMap, data.shipping);
  const shippingAddress = fillValues(addressFieldsMap, data.shipping);
  if (shipping || shippingAddress) {
    source.source_order.shipping = {
      ...(shipping ? shipping : {}),
      ...(shippingAddress ? { address: shippingAddress } : {}),
    };
  }

  source.klarna = {
    ...source.klarna,
    ...fillValues(
      billingNameFieldsMap,
      data.billing || get(data, 'account.billing') || data.shipping,
    ),
  };
  const billing = fillValues(billingFieldsMap, data.account);
  const billingAddress = fillValues(
    addressFieldsMap,
    data.billing || get(data, 'account.billing') || data.shipping,
  );
  if (billing || billingAddress) {
    source.owner = {
      ...(billing ? billing : {}),
      ...(billingAddress ? { address: billingAddress } : {}),
    };
  }
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

async function createPaymentMethod(stripe, cardElement, authorize, cart) {
  const billingDetails = getBillingDetails(cart);
  const { paymentMethod, error: paymentMethodError } =
    await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      ...(!isEmpty(billingDetails) ? { billing_details: billingDetails } : {}),
    });

  if (paymentMethodError) {
    return { error: paymentMethodError };
  }

  const customer = cart.account && cart.account.stripe_customer;
  const authorization = await authorize({
    gateway: 'stripe',
    params: {
      usage: 'off_session',
      payment_method: paymentMethod.id,
      ...(customer ? { customer } : {}),
    },
  });

  if (!authorization) {
    return;
  }

  const { error: setupIntentError } = await stripe.confirmCardSetup(
    authorization.client_secret,
  );

  return setupIntentError ? { error: setupIntentError } : authorization.card;
}

async function createIDealPaymentMethod(stripe, element, cart) {
  const billingDetails = getBillingDetails(cart);
  return await stripe.createPaymentMethod({
    type: 'ideal',
    ideal: element,
    ...(billingDetails ? { billing_details: billingDetails } : {}),
  });
}

async function createKlarnaSource(stripe, cart) {
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
  setKlarnaBillingShipping(sourceObject, cart);

  return await stripe.createSource(sourceObject);
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

export {
  createPaymentMethod,
  createIDealPaymentMethod,
  createKlarnaSource,
  createBancontactSource,
  stripeAmountByCurrency,
};
