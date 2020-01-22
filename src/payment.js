const cart = require('./cart');
const { isFunction, vaultRequest } = require('./utils');

function methods(request) {
  return {
    async createElements(params = {}, checkoutId) {
      const gateways = await vaultRequest('get', '/gateways');
      if (gateways.error) {
        throw new Error(gateways.error);
      }
      await render(request, params, checkoutId, gateways);
    },

    async create(orderId, amount, method, source) {
      return request('post', `/payments`, {
        order_id: orderId,
        amount,
        method,
        source,
      });
    },
  };
}

async function render(request, params, checkoutId, gateways = {}) {
  if (gateways.braintree && gateways.paypal) {
    const order = await cart.methods(request).getOrder(checkoutId);
    if (!order) {
      throw new Error('Order not found');
    }
    if (!(window.braintree && window.braintree.client)) {
      await loadScript(
        'braintree-web',
        'https://js.braintreegateway.com/web/3.57.0/js/client.min.js',
      );
    }
    if (!(window.braintree && window.braintree.paypalCheckout)) {
      await loadScript(
        'braintree-web-paypal-checkout',
        'https://js.braintreegateway.com/web/3.57.0/js/paypal-checkout.min.js',
      );
    }
    if (!window.paypal) {
      await loadScript(
        'paypal-sdk',
        `https://www.paypal.com/sdk/js?client-id=${gateways.paypal.client_id}&merchant-id=${gateways.paypal.merchant_id}&vault=true`,
      );
    }
    return await braintreePayPalButton(request, order, params, gateways);
  }

  throw new Error('Gateway elements are not implemented');
}

const loadScript = async (id, src) =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.type = 'text/javascript';
    script.addEventListener('load', () => resolve(), {
      once: true,
    });
    document.head.appendChild(script);
  });

async function braintreePayPalButton(request, order, params, gateways) {
  const braintree = window.braintree;
  const paypal = window.paypal;
  braintree.client
    .create({
      authorization: gateways.braintree.authorization,
    })
    .then((client) =>
      braintree.paypalCheckout.create({
        client,
      }),
    )
    .then((paypalCheckoutInstance) => {
      const paramsPayment = params.payment || {};
      const payment = {
        flow: 'vault',
        currency: paramsPayment.currency || 'USD',
        amount: paramsPayment.amount || order.grand_total,
      };
      return paypal
        .Buttons({
          style: params.style || {},
          createBillingAgreement: () => paypalCheckoutInstance.createPayment(payment),
          onApprove: (data, actions) =>
            paypalCheckoutInstance
              .tokenizePayment(data)
              .then((card) => methods(request).create(order.id, payment.amount, 'paypal', card))
              .then((result) => (isFunction(params.onDone) ? params.onDone(result) : result)),
          onCancel: isFunction(params.onCancel)
            ? () => params.onCancel()
            : () => console.log('PayPal payment cancelled'),
          onError: isFunction(params.onError)
            ? (err) => params.onError(err)
            : (err) => console.error('PayPal error', err),
        })
        .render(params.elementId || '#paypal-button');
    })
    .catch(
      isFunction(params.onError) ? params.onError : (err) => console.error('PayPal error', err),
    );
}

module.exports = {
  methods,
};
