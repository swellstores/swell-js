// Pure helpers: which payment methods a cart can use. `methods` is the store's
// payment method list, as an array of `{ id, gateway, ... }` (checkout
// settings) or an object keyed by method id (`swell.payment.methods()`).

const WALLET_METHODS = ['amazon', 'apple', 'google', 'paypal', 'sezzle'];
const STANDARD_METHODS = ['card', 'paypal', 'amazon'];

function toList(methods) {
  if (Array.isArray(methods)) {
    return methods;
  }

  return Object.entries(methods || {}).map(([id, method]) => ({
    id,
    ...method,
  }));
}

function gatewayOf(list, id) {
  return list.find((method) => method.id === id)?.gateway;
}

/**
 * The methods of the list a cart can pay with.
 *
 * @param {object} cart
 * @param {Array<object> | object} methods
 * @returns {Array<object>}
 */
export function availableMethods(cart, methods) {
  const list = toList(methods);
  const { capture_total, subscription_delivery, billing } = cart;
  const stripeCard = gatewayOf(list, 'card') === 'stripe';
  const saferpayCard = gatewayOf(list, 'card') === 'saferpay';

  return list.filter((method) => {
    const { id } = method;
    const gateway = method.gateway;

    // a wallet method shows only once it paid, when there is an amount to pay
    if (
      (capture_total > 0 || subscription_delivery) &&
      WALLET_METHODS.includes(id)
    ) {
      return Boolean(billing?.[id]);
    }

    if (stripeCard && ['ideal', 'klarna', 'bancontact'].includes(id)) {
      return gateway === 'stripe';
    }

    if (saferpayCard && id === 'twint') {
      return gateway === 'saferpay';
    }

    if (id === 'paysafecard') {
      return true;
    }

    if (id === 'klarna' && gateway === 'klarna') {
      return true;
    }

    return (
      STANDARD_METHODS.includes(id) ||
      Boolean(method.manual) ||
      Boolean(method.extension_app_id)
    );
  });
}

/**
 * Whether the cart still needs a payment method: everything but a PayPal
 * payment already authorized in its own window.
 *
 * @param {object} cart
 * @returns {boolean}
 */
export function needsPayment(cart) {
  const { method, paypal } = cart.billing || {};

  if (method && method !== 'paypal') {
    return true;
  }

  return !(paypal?.payment_id && paypal?.payer_id);
}

/**
 * The method to preselect: the cart's billing method, else the first
 * available one; `null` when the cart has nothing to collect.
 *
 * @param {object} cart
 * @param {Array<object> | object} methods
 * @returns {string | null}
 */
export function defaultMethod(cart, methods) {
  const method =
    cart.billing?.method || availableMethods(cart, methods)[0]?.id || null;

  if (cart.capture_total > 0 || cart.subscription_delivery) {
    return method;
  }

  return null;
}
