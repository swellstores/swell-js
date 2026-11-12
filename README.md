# Swell.js - Headless ecommerce storefront SDK

Universal JavaScript client for Swell's Frontend API, providing client-safe access to store and customer data. You can use it in JAMstack or SSR apps to:

- Fetch products, categories, store settings, nav menus, and custom content
- Create, recover, and update shopping carts
- Build custom checkout and subscription flows
- Authenticate customers and allow them to edit account details, orders, and subscriptions
- Resolve linked content to dynamically generate page URLs
- Format prices in the store's currency

> This SDK implements a subset of operations available in Swell's [Backend API](https://developers.swell.is/backend-api/) and is authorized with a public key + session token, making it safe to use in any context. You should only use the Backend API server-side, and keep your secret keys stored as environment variables.

**About Swell**

[Swell](https://www.swell.is) is an ecommerce platform with subscriptions and B2B pricing built in. Run your store on a Swell theme, or [go headless](https://www.swell.is/headless-commerce) with its APIs.

## Checkout payments

Besides `createElements`, `tokenize` and `handleRedirect` (see the documentation), `swell.payment` offers helpers a checkout page needs:

- `tokenize({ card: { createIntent: false } })` stores a Stripe card without authorizing it now. `tokenize({ card: { paymentMethod: 'pm_…' } })` authorizes a Stripe card the shopper already has (a saved card, a wallet's payment method) with an intent and 3-D Secure, like a new card, before the order is submitted. Both reuse the cart's intent while it still matches the card and amount.
- Saferpay card and TWINT (`twint`) redirect to the Saferpay payment page from `tokenize` and come back through `handleRedirect`; iDEAL returns through `handleRedirect({ ideal })` too.
- Stripe iDEAL needs no element: `tokenize({ ideal: {} })` without `createElements` redirects to the iDEAL page, where the shopper picks the bank, and returns through `handleRedirect({ ideal })`.
- `handleAsyncRedirect(order)` sends the shopper to the gateway when a submitted order waits for an asynchronous payment.
- Stripe card and iDEAL can render through the Stripe [Payment Element](https://docs.stripe.com/payments/payment-element) instead of the split elements: pass `paymentElement: true` to both `createElements` and `tokenize`. Stripe draws the whole form (fields, labels, errors) and takes its look from `appearance` ([Appearance API](https://docs.stripe.com/elements/appearance-api)). The element mounts into `#payment-element` unless `elementId` is set; `options` go to `elements.create('payment')` over the defaults `layout: 'tabs'`, `fields.billingDetails: 'never'` (billing details come from the cart) and no Apple Pay / Google Pay. `tokenize` re-reads the cart and updates the amount before `elements.submit()`, so a changed cart total needs no extra call.

```js
const card = {
  paymentElement: true,
  appearance: {
    theme: 'stripe',
    labels: 'floating',
    variables: { colorPrimary: '#111' },
  },
  elementId: 'card-payment-element',
  onChange: (event) => setComplete(event.complete),
  onSuccess: () => submitOrder(),
  onError: (error) => showError(error.message),
};

await swell.payment.createElements({ card });
// on "Pay": validates, creates the PaymentMethod and the intent, stores them on the cart
await swell.payment.tokenize({ card });

// iDEAL: the same flag; tokenize redirects to the bank and returns through handleRedirect({ ideal })
await swell.payment.createElements({
  ideal: {
    paymentElement: true,
    appearance,
    elementId: 'ideal-payment-element',
  },
});
```

## Deprecated

- `swell.app` (app components rendered by swell-js) is deprecated and will be removed in the next major version. Apps render their components through [`@swell/apps-sdk/components`](https://www.npmjs.com/package/@swell/apps-sdk) instead; hosted checkout mounts payment components at the place `checkout.payment.methods`.

## Documentation

📖 [**View Swell.js Documentation**](https://developers.swell.is/frontend-api/)
