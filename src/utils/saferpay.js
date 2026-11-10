import { amountInCents } from '../payment/utils';

// Saferpay payment-page brands per Swell method id; a list is joined because the
// vault rejects arrays in `PaymentMethods`
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
  ].join(','),
  twint: 'TWINT',
};

/**
 * @param {string} method 'card' or 'twint'
 * @returns {string}
 */
export function getSaferpayPaymentMethods(method) {
  return PAYMENT_METHODS[method];
}

/**
 * The Saferpay payment page request for a cart.
 *
 * @param {object} cart
 * @param {string} method 'card' or 'twint'
 * @returns {object}
 */
export function getSaferpayPaymentPageData(cart, method) {
  const currency = (cart.currency || 'USD').toUpperCase();
  const returnUrl = window.location.origin + window.location.pathname;

  return {
    Payment: {
      Amount: {
        Value: amountInCents(currency, cart.grand_total || 0),
        CurrencyCode: currency,
      },
      Description: 'Saferpay payment powered by Swell',
    },
    PaymentMethods: getSaferpayPaymentMethods(method),
    ReturnUrls: {
      Success: `${returnUrl}?gateway=saferpay&redirect_status=succeeded`,
      Fail: `${returnUrl}?gateway=saferpay&redirect_status=failed`,
      Abort: `${returnUrl}?gateway=saferpay&redirect_status=canceled`,
    },
  };
}

/**
 * @param {object} state the Saferpay transaction state
 * @returns {boolean}
 */
export function isSaferpayCardPayment(state) {
  const brand = state?.PaymentMeans?.Brand;

  return Boolean(
    state?.RegistrationResult?.Success &&
      brand &&
      PAYMENT_METHODS.card.split(',').includes(brand.PaymentMethod),
  );
}

/**
 * @param {object} state the Saferpay transaction state
 * @returns {boolean}
 */
export function isSaferpayTwintPayment(state) {
  return state?.PaymentMeans?.Brand?.PaymentMethod === 'TWINT';
}

/**
 * The card stored on the cart's billing from a Saferpay card state.
 *
 * @param {object} state
 * @returns {object}
 */
export function getSaferpayCard(state) {
  const {
    RegistrationResult: {
      Alias: { Id: token },
    },
    PaymentMeans: {
      Card: { ExpMonth: exp_month, ExpYear: exp_year, MaskedNumber },
      Brand: { Name: brand },
    },
  } = state;

  return {
    token,
    exp_month,
    exp_year,
    brand,
    last4: MaskedNumber.slice(-4),
    gateway: 'saferpay',
  };
}

/**
 * @param {object} state
 * @returns {string | undefined}
 */
export function getSaferpayTransactionId(state) {
  return state?.Transaction?.Id;
}
