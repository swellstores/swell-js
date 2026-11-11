# Changelog

## Unreleased

### Added

- Saferpay card and TWINT payments through the Saferpay payment page: `tokenize({ card })` / `tokenize({ twint })` redirect, `handleRedirect({ card, twint })` stores the registered card or the TWINT transaction. `tokenize({ card: { replace: true } })` registers a new card when the cart already has one.
- `handleRedirect({ ideal })`: the iDEAL return URL now carries `gateway=stripe`, and the handler checks the payment intent.
- Stripe iDEAL without an element: `tokenize({ ideal: {} })` without `createElements` creates the payment method and redirects to the iDEAL page, where the shopper picks the bank. The Payment Element and `idealBank` paths are unchanged.
- `tokenize({ card: { createIntent: false } })` stores a Stripe card without a payment intent.
- `tokenize({ card: { cartCard: true } })` authorizes the Stripe card already on the cart (a saved card, a wallet's `pm_` payment method) with a payment intent and 3-D Secure in the page, without an element.
- Card gateways without an element (Braintree, Authorize.Net, test): `tokenize({ card: { data, billing } })` tokenizes the host's card through the vault and stores it on the cart.
- `payment.availableMethods(cart, methods)`, `payment.defaultMethod(cart, methods)`, `payment.needsPayment(cart)`: pure helpers for the methods a cart can use.
- `payment.handleAsyncRedirect(order)`: redirects to the gateway when a submitted order waits for an asynchronous payment.
- Stripe card and iDEAL: `createElements({ card: { paymentElement: true, appearance } })` / `{ ideal: ... }` render the Stripe Payment Element styled through the Appearance API; `tokenize` with the same flag submits it and runs the existing intent flow. The split elements stay the default.

### Deprecated

- `swell.app`: app components are rendered by `@swell/apps-sdk/components`. The module warns once on `load()` and will be removed in the next major version.
