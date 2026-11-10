# Changelog

## Unreleased

### Added

- Saferpay card and TWINT payments through the Saferpay payment page: `tokenize({ card })` / `tokenize({ twint })` redirect, `handleRedirect({ card, twint })` stores the registered card or the TWINT transaction. `tokenize({ card: { replace: true } })` registers a new card when the cart already has one.
- `handleRedirect({ ideal })`: the iDEAL return URL now carries `gateway=stripe`, and the handler checks the payment intent.
- `tokenize({ card: { createIntent: false } })` stores a Stripe card without a payment intent.
- Card gateways without an element (Braintree, Authorize.Net, test): `tokenize({ card: { data, billing } })` tokenizes the host's card through the vault and stores it on the cart.
- `payment.availableMethods(cart, methods)`, `payment.defaultMethod(cart, methods)`, `payment.needsPayment(cart)`: pure helpers for the methods a cart can use.
- `payment.handleAsyncRedirect(order)`: redirects to the gateway when a submitted order waits for an asynchronous payment.

### Deprecated

- `swell.app`: app components are rendered by `@swell/apps-sdk/components`. The module warns once on `load()` and will be removed in the next major version.
