## Stripe + Klarna & iDEAL integration

This guide explains how to integrate Klarna and/or iDEAL using Stripe sources with a custom checkout flow.

​
Connect a Stripe accountto Swell (Settings > Payments), then see "Advanced options" under Stripe settings and check `Enable Klarna` / `Enable iDEAL`.
​
#####  Using Stripe.js
​
[Include Stripe.js](https://stripe.com/docs/js/including) on the payment page of your site. This can be done in two ways:
​
1. Load directly from `https://js.stripe.com`. To do this, you need to add a script to the page:
```html
<script src="https://js.stripe.com/v3/"></script>
```
2. Use Stripe.js as a module. Stripe provide an [npm package](https://github.com/stripe/stripe-js) that makes it easier to load and use Stripe.js as a module.
​
##### Initializing Stripe.js
​
After loading Stripe, [initialize](https://stripe.com/docs/js/initializing) it with publishable key.
​
If the Stripe was loaded from a script:
```js
// client side
const stripe = Stripe('pk_test_...');
```
​
If the Stripe was loaded from the JS module:
​
```js
// client side
import {loadStripe} from '@stripe/stripe-js';
const stripe = await loadStripe('pk_test_...');
```
​
##### Install Stripe server-side library
​
This library will be used to access the [Stripe API](https://stripe.com/docs/api) and create payment intents. To install the [npm package](https://www.npmjs.com/package/stripe):
​
```
npm i --save stripe
```
​
Initialize Stripe with a secret key:
​
```js
// server side
const stripe = require('stripe')('sk_test_...');
```

​
#### iDEAL integration
​
##### Creating iDEAL Stripe element
​
Create a UI element with Stripe elements.
​
```js
// client side
const stripe = Stripe('pk_test_...');
​
const elements = stripe.elements();
const ideal = elements.create('idealBank', options?);
ideal.mount('#stripe-ideal');
```

 When creating an element, you may pass these [options](https://stripe.com/docs/js/elements_object/create_element?type=idealBank) for customization.

Important: following the above example, the element will be mounted in an HTML tag with the ID `stripe-ideal`. Make sure it exists on the page.
​
##### Create a payment method
​
Once the customer enters all required information and clicks to submit the order, it's necessary to [create a payment method](https://stripe.com/docs/js/payment_methods/create_payment_method):
​
```js
// client side
const stripe = Stripe('pk_test_...');
​
await stripe.createPaymentMethod({
  type: 'ideal',
  ideal: idealElement,
  billing_details: {
    name: 'Jenny Rosen',
  },
});
```
​
The above call returns:
-   `result.paymentMethod`: a  [PaymentMethod](https://stripe.com/docs/api/payment_methods) that was created successfully.
-   `result.error`: a server or client-side validation error. Refer to the  [Stripe API reference](https://stripe.com/docs/api#errors) for all possible errors.
​
##### Create a payment intent
​
To create payment intent you must pass the payment method created earlier, along with `amount` and `return_url` to which the customer will be redirected after authorizing the payment:
​
```js
// server side
const stripe = require('stripe')('sk_test_...');
​
await stripe.paymentIntents.create({
  payment_method: '<payment_method_id>',
  amount: '<amount in cents>',
  currency: 'eur',
  payment_method_types: 'ideal',
  confirmation_method: 'manual',
  confirm: true,
  return_url: '<return_url>',
});
```
​
The above call returns:
-   `result.paymentIntent`: a  [PaymentIntent](https://stripe.com/docs/api/payment_intents/object) that was created successfully.
-   `result.error`: a server or client-side validation error. Refer to the  [Stripe API reference](https://stripe.com/docs/api#errors) for all possible errors.
​
##### Payment authorization
​
If the payment intent was created successfully, then you'll need to authorize the payment:
​
```js
// client side
const stripe = Stripe('pk_test_...');
​
await stripe.handleCardAction(paymentIntent.client_secret);
```
​
This method will redirect the customer to authorize payment. After authorization, the customer will be redirected back to your site at the address specified when creating the payment intent (`return_url`).
​
##### Capturing payment and creating an order
​
When redirecting to your site, the URL will contain parameters with information about the payment:
​
|Parameter name|Description|
|--|--|
|redirect_status|Payment authorization status (`succeeded` or `failed`)|
|payment_intent|Unique identifier for the `PaymentIntent`|
|payment_intent_client_secret|A [client secret](https://stripe.com/docs/api/payment_intents/object#payment_intent_object-client_secret) related to the `PaymentIntent` object|
​

Finally, add the relevant payment details to a Cart or Order:
​
```js
const billing = {
  method: 'ideal',
  ideal: {
    token: '<payment_method_id>',
  },
  stripe_payment_intent: {
    id: '<payment_intent_id>',
    status: 'requires_confirmation',
  },
};

// Using Swell JS library
await swell.cart.update({ billing })

// Using Swell Node.js library
await swell.put('/carts/<id>', { billing });
```
​
#### Klarna integration
​
To make a Klarna payment, create a [Source object](https://stripe.com/docs/api/sources). Klarna does not require using Stripe elements.
​
##### Create a source object

​
```js
// Client side
const stripe = Stripe('pk_test_...');
​
await stripe.createSource({
  type: 'klarna',
  flow: 'redirect',
  amount: '<amount>',
  currency: '<iso currency code>',
  klarna: {
    product: 'payment',
    purchase_country: '<2-digit country code>',
  },
  source_order: {
    items: '<items>',
  },
  redirect: {
    return_url: '<return_url>',
  },
 });
```
​
See [Stripe docs](https://stripe.com/docs/sources/klarna#create-source) for more details on creating a source object.
​
##### Payment authorization
​
If the source was created successfully, then redirect the customer to the URL address returned in the source object (`source.redirect.url`). After authorization, customer will be redirected back to your site at the address specified when creating the source (`return_url`).
​
##### Capture payment
​
When redirecting to your site, the URL will contain parameters with information about the payment:
​
|Parameter name|Description|
|--|--|
|redirect_status|Authorization status (`succeeded`, `canceled` or `failed`)|
|source|Unique identifier for the `Source`|
​
Finally, add the relevant payment details to a Cart or Order:
​
```js
const billing = {
  method: 'klarna',
  klarna: {
    source: '<source_id>',
  },
};

// Using Swell JS library
await swell.cart.update({ billing })

// Using Swell Node.js library
await swell.put('/carts/<id>', { billing });
```
​
