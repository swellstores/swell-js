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

[Swell](https://www.swell.is) is a customizable, API-first platform for powering modern B2C/B2B shopping experiences and marketplaces. Build and connect anything using your favorite technologies, and provide admins with an easy to use dashboard.

## Checkout payments

Besides `createElements`, `tokenize` and `handleRedirect` (see the documentation), `swell.payment` offers helpers a checkout page needs:

- `availableMethods(cart, methods)`, `defaultMethod(cart, methods)` and `needsPayment(cart)` pick the methods a cart can pay with; pure functions over the store's payment method list.
- `tokenize({ card: { data, billing } })` tokenizes a card the page collected itself on gateways without an element (Braintree, Authorize.Net, test); `tokenize({ card: { createIntent: false } })` stores a Stripe card without authorizing it now.
- Saferpay card and TWINT (`twint`) redirect to the Saferpay payment page from `tokenize` and come back through `handleRedirect`; iDEAL returns through `handleRedirect({ ideal })` too.
- `handleAsyncRedirect(order)` sends the shopper to the gateway when a submitted order waits for an asynchronous payment.

## Deprecated

- `swell.app` (app components rendered by swell-js) is deprecated and will be removed in the next major version. Apps render their components through [`@swell/apps-sdk/components`](https://www.npmjs.com/package/@swell/apps-sdk) instead; hosted checkout mounts payment components at the place `checkout.payment.methods`.

## Documentation

📖 [**View Swell.js Documentation**](https://developers.swell.is/frontend-api/)
