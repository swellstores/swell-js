const get = require('lodash/get');
const toUpper = require('lodash/toUpper');
const join = require('lodash/join');
const { amountByCurrency } = require('./payment');

const PAYMENT_METHODS = {
  card: [
    'AMEX',
    'DINERS',
    'MAESTRO',
    'JCB',
    'VISA',
    'BANCONTACT',
    'MASTERCARD',
    'SAFERPAYTEST',
    'UNIONPAY',
  ],
};

function getPaymentPageData(cart) {
  const currency = toUpper(get(cart, 'currency', 'USD'));
  const amount = amountByCurrency(currency, get(cart, 'grand_total', 0));
  const returnUrl = window.location.origin + window.location.pathname;

  return {
    Payment: {
      Amount: {
        Value: amount,
        CurrencyCode: currency,
      },
      Description: 'Saferpay payment powered by Swell',
    },
    // Here 'join' is needed, because when passing an array,
    // an error occurs in schema.js (serializeData method)
    PaymentMethods: join(PAYMENT_METHODS.card, ','),
    ReturnUrls: {
      Success: `${returnUrl}?gateway=saferpay&redirect_status=succeeded`,
      Fail: `${returnUrl}?gateway=saferpay&redirect_status=failed`,
      Abort: `${returnUrl}?gateway=saferpay&redirect_status=canceled`,
    },
  };
}

module.exports = {
  getPaymentPageData,
};
