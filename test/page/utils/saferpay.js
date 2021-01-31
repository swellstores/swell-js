import { get, includes } from 'lodash';

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

const isCardPaymentMethod = (method) => includes(PAYMENT_METHODS.card, method);

export function isSaferpayCardPayment(state) {
  const { Brand } = get(state, 'PaymentMeans', {});
  const { Success, AuthenticationResult } = get(state, 'RegistrationResult', {});
  const { Result } = AuthenticationResult || {};

  return Result === 'OK' && Success && Brand && isCardPaymentMethod(Brand.PaymentMethod);
}

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
    last4: MaskedNumber.substring(MaskedNumber.length - 4),
    gateway: 'saferpay',
  };
}
