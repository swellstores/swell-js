import get from 'lodash-es/get';

function generateOrderId() {
  return Math.random().toString(36).substr(2, 9);
}

export async function createQuickpayCard(authorize) {
  const returnUrl = window.location.origin + window.location.pathname;
  const authorization = await authorize({
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

export async function getQuickpayCardDetais(id, authorize) {
  return await authorize({
    gateway: 'quickpay',
    params: { action: 'get', id },
  });
}

export async function createQuickpayPayment(cart, createIntent) {
  return await createIntent({
    gateway: 'quickpay',
    intent: {
      currency: get(cart, 'currency', 'USD'),
      order_id: generateOrderId(),
    },
  });
}
