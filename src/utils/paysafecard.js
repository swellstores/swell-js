import { get } from './index';

export function createPaysafecardPaymentData(cart) {
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
