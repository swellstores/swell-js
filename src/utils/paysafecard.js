import get from 'lodash-es/get';

export async function createPaysafecardPayment(cart, createIntent) {
  const returnUrl = window.location.origin + window.location.pathname;
  const url = `${returnUrl}?gateway=paysafecard`;

  return await createIntent({
    gateway: 'paysafecard',
    intent: {
      type: 'PAYSAFECARD',
      amount: cart.grand_total,
      redirect: {
        success_url: url,
        failure_url: url,
      },
      notification_url: url,
      customer: {
        id: get(cart, 'account.id'),
      },
      currency: get(cart, 'currency', 'USD'),
    },
  });
}
