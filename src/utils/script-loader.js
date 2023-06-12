import { loadScript, isObject, isFunction } from './index';

const SCRIPT_HANDLERS = {
  'stripe-js': loadStripe,
  'paypal-sdk': loadPaypal,
  'google-pay': loadGoogle,
  'braintree-web': loadBraintree,
  'braintree-paypal-sdk': loadBraintreePaypal,
  'braintree-web-paypal-checkout': loadBraintreePaypalCheckout,
  'braintree-google-payment': loadBraintreeGoogle,
  'braintree-apple-payment': loadBraintreeApple,
  'amazon-checkout': loadAmazonCheckout,
};

const BRAINTREE_VERSION = '3.91.0';

async function loadStripe() {
  if (!window.Stripe || window.Stripe.version !== 3) {
    await loadScript('stripe-js', 'https://js.stripe.com/v3/');
  }

  if (!window.Stripe) {
    console.error('Warning: Stripe was not loaded');
  }

  if (window.Stripe.StripeV3) {
    window.Stripe = window.Stripe.StripeV3;
  }

  if (window.Stripe.version !== 3) {
    console.error('Warning: Stripe V3 was not loaded');
  }
}

async function loadPaypal(params) {
  if (!window.paypal) {
    const { currency, client_id, merchant_id } = params;
    const paypalParams = {
      currency,
      'client-id': client_id,
      commit: false,
    };

    if (merchant_id) {
      // paypal express and ppcp onboarded
      paypalParams['merchant-id'] = merchant_id;
      paypalParams.intent = 'authorize';
    } else {
      // ppcp progressive
      paypalParams.intent = 'capture';
    }

    const urlSearchParams = new URLSearchParams(paypalParams).toString();

    await loadScript(
      'paypal-sdk',
      `https://www.paypal.com/sdk/js?${urlSearchParams}`,
      {
        'data-partner-attribution-id': 'SwellCommerce_SP',
      },
    );
  }

  if (!window.paypal) {
    console.error('Warning: PayPal was not loaded');
  }
}

async function loadGoogle() {
  if (!window.google) {
    await loadScript('google-pay', 'https://pay.google.com/gp/p/js/pay.js');
  }

  if (!window.google) {
    console.error('Warning: Google was not loaded');
  }
}

async function loadBraintree() {
  if (!window.braintree) {
    await loadScript(
      'braintree-web',
      `https://js.braintreegateway.com/web/${BRAINTREE_VERSION}/js/client.min.js`,
    );
  }

  if (!window.braintree) {
    console.error('Warning: Braintree was not loaded');
  }
}

async function loadBraintreePaypal(params) {
  if (!window.paypal) {
    const { currency, client_id, merchant_id } = params;
    const paypalParams = {
      currency,
      'client-id': client_id,
      'merchant-id': merchant_id,
      commit: false,
      vault: true,
    };
    const urlSearchParams = new URLSearchParams(paypalParams).toString();

    await loadScript(
      'braintree-paypal-sdk',
      `https://www.paypal.com/sdk/js?${urlSearchParams}`,
    );
  }

  if (!window.paypal) {
    console.error('Warning: Braintree PayPal was not loaded');
  }
}

async function loadBraintreePaypalCheckout() {
  if (window.braintree && !window.braintree.paypalCheckout) {
    await loadScript(
      'braintree-web-paypal-checkout',
      `https://js.braintreegateway.com/web/${BRAINTREE_VERSION}/js/paypal-checkout.min.js`,
    );
  }

  if (window.braintree && !window.braintree.paypalCheckout) {
    console.error('Warning: Braintree PayPal Checkout was not loaded');
  }
}

async function loadBraintreeGoogle() {
  if (window.braintree && !window.braintree.googlePayment) {
    await loadScript(
      'braintree-google-payment',
      `https://js.braintreegateway.com/web/${BRAINTREE_VERSION}/js/google-payment.min.js`,
    );
  }

  if (window.braintree && !window.braintree.googlePayment) {
    console.error('Warning: Braintree Google Payment was not loaded');
  }
}

async function loadBraintreeApple() {
  if (window.braintree && !window.braintree.applePay) {
    await loadScript(
      'braintree-apple-payment',
      `https://js.braintreegateway.com/web/${BRAINTREE_VERSION}/js/apple-pay.min.js`,
    );
  }

  if (window.braintree && !window.braintree.applePay) {
    console.error('Warning: Braintree Apple Payment was not loaded');
  }
}

async function loadAmazonCheckout() {
  if (!window.amazon) {
    await loadScript(
      'amazon-checkout',
      'https://static-na.payments-amazon.com/checkout.js',
    );
  }

  if (!window.amazon) {
    console.error('Warning: Amazon Checkout was not loaded');
  }
}

export default async function loadScripts(scripts) {
  if (!scripts) {
    return;
  }

  for (const script of scripts) {
    let scriptId = script;
    let scriptParams;

    if (isObject(script)) {
      scriptId = script.id;
      scriptParams = script.params;
    }

    const scriptHandler = SCRIPT_HANDLERS[scriptId];

    if (!isFunction(scriptHandler)) {
      console.error(`Unknown script ID: ${scriptId}`);
      continue;
    }

    await scriptHandler(scriptParams);
  }

  // Wait until the scripts are fully loaded.
  // Some scripts don't work correctly in Safari without this.
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
