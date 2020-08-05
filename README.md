# Swell.js - Headless ecommerce storefront SDK

Universal JavaScript client for Swell's Frontend API, providing client-safe access to store and customer data. You can use it in JAMstack or SSR apps to:

- Fetch products, categories, store settings, nav menus, and custom content
- Create, recover, and update shopping carts
- Build custom checkout and subscription flows
- Authenticate customers and allow them to edit account details, orders, and subscriptions
- Resolve linked content to dynamically generate page URLs
- Format prices in the store's currency

> This SDK implements a subset of operations available in Swell's [Backend API](https://swell.store/docs/api) and is authorized with a public key + session token, making it safe to use in any context. You should only use the Backend API server-side, and keep your secret keys stored as environment variables.

**About Swell**

[Swell](https://www.swell.is) is a customizable, API-first platform for powering modern B2C/B2B shopping experiences and marketplaces. Build and connect anything using your favorite technologies, and provide admins with an easy to use dashboard.

<details>
<summary>Table of contents</summary>
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Configuration](#configuration)
  - [Options](#options)
    - [useCamelCase](#usecamelcase)
- [Basic usage](#basic-usage)
- [Settings](#settings)
  - [Fetch store settings](#fetch-store-settings)
  - [Get setting by path](#get-setting-by-path)
  - [Fetch all nav menus](#fetch-all-nav-menus)
  - [Get nav menu by ID](#get-nav-menu-by-id)
  - [Fetch payment settings](#fetch-payment-settings)
- [Products](#products)
  - [List products](#list-products)
  - [List products + variants](#list-products--variants)
  - [List products by category](#list-products-by-category)
  - [Get a product](#get-a-product)
  - [Search for products](#search-for-products)
  - [Find a product variant matching selected options](#find-a-product-variant-matching-selected-options)
- [Categories](#categories)
  - [List categories](#list-categories)
  - [Get a category](#get-a-category)
- [Attributes](#attributes)
  - [List attributes](#list-attributes)
  - [Get an attribute](#get-an-attribute)
- [Shopping carts](#shopping-carts)
  - [Get a cart](#get-a-cart)
  - [Add an item](#add-an-item)
  - [Update an item](#update-an-item)
  - [Update all items](#update-all-items)
  - [Remove an item](#remove-an-item)
  - [Empty the cart](#empty-the-cart)
  - [Recover a cart](#recover-a-cart)
  - [Update cart account info](#update-cart-account-info)
  - [Update cart shipping info](#update-cart-shipping-info)
  - [Update cart billing info](#update-cart-billing-info)
  - [Apply a coupon (or gift card) code](#apply-a-coupon-or-gift-card-code)
  - [Apply a gift card](#apply-a-gift-card)
  - [Remove coupon](#remove-coupon)
  - [Remove a gift card](#remove-a-gift-card)
  - [Get shipping rates](#get-shipping-rates)
  - [Submit an order](#submit-an-order)
  - [Get order details](#get-order-details)
  - [Get checkout settings](#get-checkout-settings)
- [Customer accounts](#customer-accounts)
  - [Log in](#log-in)
  - [Log out](#log-out)
  - [Get logged in account](#get-logged-in-account)
  - [Create an account](#create-an-account)
  - [Update the account](#update-the-account)
  - [Send a password reset email](#send-a-password-reset-email)
  - [Reset the account password](#reset-the-account-password)
  - [List addresses](#list-addresses)
  - [Create an address](#create-an-address)
  - [Delete an address](#delete-an-address)
  - [List saved credit cards](#list-saved-credit-cards)
  - [Create a new credit card](#create-a-new-credit-card)
  - [Delete a credit card](#delete-a-credit-card)
  - [List account orders](#list-account-orders)
  - [List account orders with shipments](#list-account-orders-with-shipments)
- [Subscriptions](#subscriptions)
  - [Retrieve all subscriptions](#retrieve-all-subscriptions)
  - [Retrieve a subscription](#retrieve-a-subscription)
  - [Create a new subscription](#create-a-new-subscription)
  - [Update a subscription](#update-a-subscription)
  - [Change a subscription plan](#change-a-subscription-plan)
  - [Cancel a subscription](#cancel-a-subscription)
  - [Add an invoice item](#add-an-invoice-item)
  - [Update an invoice item](#update-an-invoice-item)
  - [Update all invoice items](#update-all-invoice-items)
  - [Remove an item](#remove-an-item-1)
  - [Remove all items](#remove-all-items)
- [Payment elements](#payment-elements)
  - [Stripe](#stripe)
    - [Render a Stripe card element](#render-a-stripe-card-element)
    - [Render other Stripe elements](#render-other-stripe-elements)
  - [PayPal button](#paypal-button)
  - [Tokenize payment elements](#tokenize-payment-elements)
- [Direct credit card tokenization](#direct-credit-card-tokenization)
  - [Create a card token](#create-a-card-token)
    - [Successful token response](#successful-token-response)
    - [Error token response](#error-token-response)
  - [Validate card number](#validate-card-number)
  - [Validate card expiry](#validate-card-expiry)
  - [Validate CVC code](#validate-cvc-code)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

</details>

## Installation

```bash
npm install swell-js # or yarn add swell-js
```

## Configuration

The client uses your store ID and public key for authorization. You can find these in your dashboard under _Settings > API_.

```javascript
swell.init('<store-id>', '<public_key>');
```

> **Note**: `swell.auth()` was renamed to `swell.init()` in v1.3.0.

#### Options

If your application uses camelCase, you can set a flag to transform the API's snake_case responses. This works on objects you pass to it as well.

##### useCamelCase

```javascript
const options = {
  useCamelCase: // true | false (default is false)
};

swell.init('<store-id>', '<public_key>', options)
```

## Basic usage

If a code example has the `await` prefix, the method returns a promise. All other methods are synchronous. We're using ES6 async/await syntax here, but you can use regular Promises too.

```javascript
import swell from 'swell-js';

// Initialize the client first
swell.init('my-store', 'pk_md0JkpLnp9gBjkQ085oiebb0XBuwqZX9');

// Now you can use any method
await swell.products.list({
  category: 't-shirts',
  limit: 25,
  page: 1,
});
```

## Settings

#### Fetch store settings

_Returns an object representing store settings, and saves it to an internal cache for accessing synchronously._

> **Note:** This must be called before trying to get a setting by path

```javascript
await swell.settings.get();
```

#### Get setting by path

_Returns a value from the store settings object using path notation, with an optional default if the value is undefined._

```javascript
swell.settings.get('colors.primary.dark', '#000000');
```

#### Fetch all nav menus

_Returns an array containing store navigation menus, and saves it to an internal cache for accessing synchronously._

> **Note:** This must be called before trying to get a menu by ID

```javascript
await swell.settings.menus();
```

#### Get nav menu by ID

_Returns a single navigation menu object._

```javascript
swell.settings.menus('header');
```

#### Fetch payment settings

_Returns an object representing payment settings, and saves it to an internal cache for using with [checkout](#checkout) methods._

```javascript
swell.settings.payments();
```

## Products

#### List products

_Returns all products, with offset pagination using `limit` and `page`._

```javascript
await swell.products.list({
  limit: 25, // Max. 100
  page: 1,
});
```

#### List products + variants

_Returns all products and their active variants, with offset pagination using `limit` and `page`._

```javascript
await swell.products.list({
  limit: 25, // Max. 100
  page: 1,
  expand: ['variants'],
});
```

#### List products by category

_Returns products in a specific category, with offset pagination using `limit` and `page`._

```javascript
await swell.products.list({
  category: 't-shirts', // Slug or ID
  limit: 25, // Max. 100
  page: 1,
});
```

#### Get a product

_Returns a single product._

```javascript
// By slug
await swell.products.get('blue-shoes');

// By ID
await swell.products.get('5c15505200c7d14d851e510f');
```

#### Search for products

Perform a full text search with a string. The search operation is performed using AND syntax, where all words must be present in at least one field of the product.

_Returns products matching the search query string, with offset pagination using `limit` and `page`._

```javascript
await swell.products.list({
  search: 'black jeans', // Any text string
  limit: 25, // Max. 100
  page: 1,
});
```

#### Find a product variant matching selected options

Resolve the correct `price`, `sale_price`, `orig_price` and `stock_status` values based on the customer's chosen options. Typically you would <a href="#get-product">retrieve a product</a> earlier in the page's lifecycle and pass it to this method along with the options. Options can be either an array or an object with option name/value pairs.

_Returns a new object with product and option/variant values merged together._

```javascript
await swell.products.variation(product, {
  Size: 'Medium',
  Color: 'Turquoise',
});
```

## Categories

#### List categories

_Returns a list of product categories, with offset pagination using `limit` and `page`._

```javascript
await swell.categories.list({
  limit: 25,
  page: 1,
});
```

#### Get a category

_Returns a single category._

```javascript
// By slug
await swell.categories.get('mens-shirts');

// By ID
await swell.categories.get('5c15505200c7d14d851e510g');
```

## Attributes

#### List attributes

_Returns a list of product attributes, with offset pagination using `limit` and `page`._

```javascript
await swell.attributes.list({
  limit: 25,
  page: 1,
});
```

#### Get an attribute

_Returns a single attribute._

```javascript
// By slug
await swell.attributes.get('color');

// By ID
await swell.attributes.get('5c15505200c7d14d851e510g');
```

## Shopping carts

#### Get a cart

Retrieve the cart attached to the current session.

_Returns the cart object or `null` if no items have been added yet._

```javascript
await swell.cart.get();
```

#### Add an item

Add a single item to the cart. Item options can be either an array of product options or an object with product option name/value pairs.

_Returns the updated cart object._

```javascript
// Options as array
await swell.cart.addItem({
  product_id: '5c15505200c7d14d851e510f',
  quantity: 1,
  options: [
    { name: 'Size', value: 'S' },
    { name: 'Color', value: 'Midnight blue' },
  ],
});

// Options as object
await swell.cart.addItem({
  product_id: '5c15505200c7d14d851e510f',
  quantity: 1,
  options: {
    Size: 'S',
    Color: 'Midnight blue',
  },
});
```

#### Update an item

Update properties of a single cart item by ID.

_Returns the updated cart object._

```javascript
await swell.cart.updateItem('7d51p8ce72f5542e009fa4c8', {
  quantity: 2,
});
```

#### Update all items

If you want to update multiple items at once, you can clone `cart.items`, iterate through the items to perform your operation(s), then use this method to replace `cart.items` with your updated array.

_Returns the updated cart object._

```javascript
await swell.cart.setItems([
  {
    id: '5c15505200c7d14d851e510f',
    quantity: 2,
    options: [{ id: 'Color', value: 'Midnight blue' }],
  },
  {
    id: '5c15505200c7d14d851e510g',
    quantity: 3,
    options: [{ id: 'Color', value: 'Ivory' }],
  },
  {
    id: '5c15505200c7d14d851e510h',
    quantity: 4,
    options: [{ id: 'Color', value: 'Bright red' }],
  },
]);
```

#### Remove an item

Remove a single item from the cart by ID.

_Returns the updated cart object._

```javascript
await swell.cart.removeItem('5c15505200c7d14d851e510f');
```

#### Empty the cart

Remove all items from the cart.

_Returns the updated cart object._

```javascript
await swell.cart.setItems([]);
```

#### Recover a cart

Normally used with an abandoned cart recovery email. The email should have a link to your store with a `checkout_id` identifying the cart that was abandoned. Calling this method will add the cart to the current session and mark it as `recovered`.

_Returns the recovered cart object._

```javascript
await swell.cart.recover('878663b2fb4175b128e40de428cd7b0c');
```

#### Update cart account info

Update the cart with customer account information.

An account is assigned to a cart by email address.

- If the account has no password set, it's considered a guest checkout and the cart will have the property `guest=true`.
- If the account has a password set, the cart will have the property `account_logged_in=false`. You can use this to prompt the user to <a href="#login">log in</a> to continue. Once the account is logged in, `account_logged_in` will be `true`.

_Returns the updated cart object._

```javascript
await swell.cart.update({
  account: {
    email: 'julia@example.com',
    email_optin: true, // Optional; indicates the customer has consented to receive marketing emails
    password: 'thepassword', // Optional; sets the customer's password if one doesn't exist yet
  },
});
```

#### Update cart shipping info

Update the cart with customer shipping information.

_Returns the updated cart object._

```javascript
await swell.cart.update({
  shipping: {
    name: 'Julia Sanchez',
    address1: '560 Olive Drive',
    address2: '',
    city: 'Ellinwood',
    state: 'KS',
    zip: '67526',
    country: 'United States',
    phone: '620-564-3737',
  },
});
```

#### Update cart billing info

Update the cart with customer billing information. This method can update both shipping and billing at once if desired.

_Returns the updated cart object._

```javascript
await swell.cart.update({
  billing: {
    name: 'Julia Sanchez',
    address1: '560 Olive Drive',
    address2: '',
    city: 'Ellinwood',
    state: 'KS',
    zip: '67526',
    country: 'United States',
    phone: '620-564-3737',
    // Paying with credit card
    card: {
      // Token from swell.card.createToken() or Stripe.js
      token: 'tok_1H0Qu92eZvKYlo2CsKGk6...',
    },
    // Paying with PayPal
    paypal: {
      payer_id: '...',
      payment_id: '...',
    },
    // Paying with Amazon Pay
    amazon: {
      access_token: '...',
      order_reference_id: '...',
    },
    // Paying with Affirm
    affirm: {
      checkout_token: '...',
    },
  },
});
```

> **Note:** In February 2019, PayPal introduced Smart Payment Buttons. Swell's integration uses a previous version named checkout.js, which continues to be supported by PayPal and Swell. <a href="https://www.notion.so/swellstores/Swell-PayPal-integration-examples-e693bcb3cdeb435f91488bb9ed671a3e">More details and examples</a>.

#### Apply a coupon (or gift card) code

Use to apply a coupon or gift card code to the cart (works with both so you can have a single input field). A cart can have one coupon and multiple gift card codes applied at once. Codes are not case sensitive.

_Returns the updated cart object if code is valid. Otherwise, returns a validation error._

```javascript
await swell.cart.applyCoupon('SUMMERTIME');
```

#### Apply a gift card

Use to apply a gift card code to the cart. A cart can have multiple gift card codes applied at once. Codes are not case sensitive.

_Returns the updated cart object if code is valid. Otherwise, returns a validation error._

```javascript
await swell.cart.applyGiftcard('BUYS SFX4 BMZH YY7N');
```

#### Remove coupon

Use to remove the coupon code from the cart, if one was applied.

```javascript
await swell.cart.removeCouponCode();
```

#### Remove a gift card

Use to remove a gift card from the cart, by passing the ID that was assigned to `cart.giftcards.id`.

```javascript
await swell.cart.removeGiftcard('5c15505200c7d14d851e51af');
```

#### Get shipping rates

A shipment rating contains all available shipping services and their price, based on cart items and the customer's shipping address. The cart must have at least `shipping.country` set to generate a rating.

_Returns an object with shipping services and rates._

```javascript
await swell.cart.getShippingRates();
```

#### Submit an order

When a customer has entered all the information needed to finalize their order, call this method to process their payment and convert the cart to an order.

_Returns the newly created order._

```javascript
await swell.cart.submitOrder();
```

#### Get order details

When a cart is submitted, the newly created order will be returned. However, you can use this method if you need to get the order information separately. You can also retrieve an order with a `checkout_id`, allowing you to display order details from an email containing a link like `https://my-store.com/order/{checkout_id}`.

_Returns order with the passed ID, or if no parameters are passed, the last order placed in the current session._

```javascript
// Get the last order placed in the current session
await swell.cart.getOrder();

// Get an order by checkout_id
await swell.cart.getOrder('878663b2fb4175b128e40de428cd7b0c');
```

#### Get checkout settings

Use to retrieve settings that can affect checkout behavior.

_Returns object with:_

- `name` - Store name
- `currency` - Store base currency
- `support_email` - Email address for customer support
- `fields` - Set of checkout fields to show as optional or required
- `scripts` - Custom scripts including script tags
- `accounts` - Indicates whether account login is `optional`, `disabled` or `required`
- `email_optin` - Indicates whether email newsletter opt-in should be presented as optional
- `terms_policy` - Store terms and conditions
- `refund_policy` - Store refund policy
- `privacy_policy` - Store privacy policy
- `theme` - Checkout style settings
- `countries` - List of country codes that have shipping zones configured
- `payment_methods` - List of active payment methods
- `coupons` - Indicates whether the store has coupons
- `giftcards` - Indicates whether the store has gift cards

```javascript
await swell.cart.getSettings();
```

## Customer accounts

Authenticate customers and fetch/manage manage their account data.

#### Log in

Use to authenticate a customer with their email address and password. If the email/password combo is correct, their account will be added to the session, making customer-specific methods available. This will set `account_logged_in=true` and `guest=false`.

```javascript
await swell.account.login('julia@example.com', 'thepassword');
```

#### Log out

Use to disconnect the account from the current session. This will set `account_logged_in=false` and `guest=true`.

```javascript
await swell.account.logout();
```

#### Get logged in account

Use to get information about the customer currently logged in.

_Returns the account object, or `null` if the customer is not logged in._

```javascript
await swell.account.get();
```

#### Create an account

Use to create a new customer account and attach it to the current session.

_Returns the newly created account object._

```javascript
await swell.account.create({
  email: 'julia@example.com',
  first_name: 'Julia', // Optional
  last_name: 'Sanchez', // Optional
  email_optin: true, // Optional
  password: 'thepassword', // Optional
});
```

#### Update the account

Use to update properties of the currently logged in account.

_Returns the updated account object if successful. Otherwise, returns a validation error._

```javascript
await swell.account.update({
  email: 'julia@anotherexample.com',
  first_name: 'Julia', // Optional
  last_name: 'Sanchez', // Optional
  email_optin: true, // Optional
  password: 'thepassword', // Optional
});
```

#### Send a password reset email

Use to send a email to the customer with a link to reset their password. If the email address provided doesn't exist in the system, no email will be sent.

_Returns a value indicating success in either case._

```javascript
await swell.account.recover({
  email: 'julia@example.com',
});
```

#### Reset the account password

Use to set the customer's new password. This requires the `reset_key` from the recovery email (see above). The password recovery email should link to your storefront with `reset_key` as a URL parameter that you can pass to this method.

```javascript
await swell.account.recover({
  reset_key: 'e42e66fc7e3f00e9e179w20ad1841146',
  password: 'thenewpassword',
});
```

#### List addresses

Use to get a list of addresses on file for the account. These are stored automatically when a non-guest user checks out and chooses to save their information for later.

_Returns all addresses, with offset pagination using `limit` and `page`._

```javascript
await swell.account.getAddresses();
```

#### Create an address

Use to add a new address to the account.

_Returns the newly created address object._

```javascript
await swell.account.createAddress({
  name: 'Julia Sanchez',
  address1: 'Apartment 16B',
  address2: '2602 Pinewood Drive',
  city: 'Jacksonville',
  state: 'FL',
  zip: '32216',
  country: 'United States',
  phone: '904-504-4760',
});
```

#### Delete an address

Use to remove an existing address from the account by ID.

_Returns the deleted address object._

```javascript
await swell.account.deleteAddress('5c15505200c7d14d851e510f');
```

#### List saved credit cards

Use to get a list of credit cards on file for the account. These are stored automatically when a non-guest user checks out and chooses to save their information for later.

_Returns all addresses, with offset pagination using `limit` and `page`._

```javascript
await swell.account.getCards();
```

#### Create a new credit card

Use to save a tokenized credit card to the account for future use. Credit card tokens can be created using `swell.card.createToken` or Stripe.js.

```javascript
await swell.account.createCard({
  token: '...',
});
```

#### Delete a credit card

Use to remove a saved credit card from the account by ID.

```javascript
await swell.account.deleteCard('5c15505200c7d14d851e510f');
```

#### List account orders

Return a list of orders placed by a customer.

```javascript
await swell.account.getOrders({
  limit: 10,
  page: 2,
});
```

#### List account orders with shipments

Return a list of orders placed by a customer including shipments with tracking information.

_Returns all orders, with offset pagination using `limit` and `page`._

```javascript
await swell.account.getOrders({
  expand: 'shipments',
});
```

## Subscriptions

Fetch and manage subscriptions associated with the logged in customer's account.

#### Retrieve all subscriptions

Return a list of active and canceled subscriptions for an account.

_Returns all subscriptions, with offset pagination using `limit` and `page`._

```javascript
await swell.subscriptions.list();
```

#### Retrieve a subscription

Return a single subscription by ID.

```javascript
await swell.subscriptions.get(id);
```

#### Create a new subscription

Subscribe the customer to a new product for recurring billing.

```javascript
await swell.subscriptions.create({
  product_id: '5c15505200c7d14d851e510f',
  // the following parameters are optional
  variant_id: '5c15505200c7d14d851e510g',
  quantity: 1,
  coupon_code: '10PERCENTOFF',
  items: [
    {
      product_id: '5c15505200c7d14d851e510h',
      quantity: 1,
    },
  ],
});
```

#### Update a subscription

```javascript
await swell.subscriptions.update('5c15505200c7d14d851e510f', {
  // the following parameters are optional
  quantity: 2,
  coupon_code: '10PERCENTOFF',
  items: [
    {
      product_id: '5c15505200c7d14d851e510h',
      quantity: 1,
    },
  ],
});
```

#### Change a subscription plan

```javascript
await swell.subscriptions.update('5c15505200c7d14d851e510f', {
  product_id: '5c15505200c7d14d851e510g',
  variant_id: '5c15505200c7d14d851e510h', // optional
  quantity: 2,
});
```

#### Cancel a subscription

```javascript
await swell.subscriptions.update('5c15505200c7d14d851e510f', {
  canceled: true,
});
```

#### Add an invoice item

```javascript
await swell.subscriptions.addItem('5c15505200c7d14d851e510f', {
  product_id: '5c15505200c7d14d851e510f',
  quantity: 1,
  options: [
    {
      id: 'color',
      value: 'Blue',
    },
  ],
});
```

#### Update an invoice item

```javascript
await swell.subscriptions.updateItem('5c15505200c7d14d851e510f', '<item_id>', {
  quantity: 2,
});
```

#### Update all invoice items

```javascript
await swell.subscriptions.setItems('5c15505200c7d14d851e510e', [
  {
    id: '5c15505200c7d14d851e510f',
    quantity: 2,
    options: [
      {
        id: 'color',
        value: 'Blue',
      },
    ],
  },
  {
    id: '5c15505200c7d14d851e510g',
    quantity: 3,
    options: [
      {
        id: 'color',
        value: 'Red',
      },
    ],
  },
  {
    id: '5c15505200c7d14d851e510h',
    quantity: 4,
    options: [
      {
        id: 'color',
        value: 'White',
      },
    ],
  },
]);
```

#### Remove an item

```javascript
await swell.subscriptions.removeItem('5c15505200c7d14d851e510f', '<item_id>');
```

#### Remove all items

```javascript
await swell.subscriptions.setItems([]);
```

## Payment elements

Render 3rd party payment elements with settings configured by your Swell store. This method dynamically loads 3rd party libraries such as Stripe, Braintree and PayPal, in order to standardize the way payment details are captured.

Note: when using a card element, it's necessary to <a href="#tokenize-payment-elements">tokenize</a> card details before submitting an order.

#### Stripe

Render Stripe elements to capture credit card information. You can choose between a unified [card element](https://stripe.com/docs/js/elements_object/create_element?type=card 'card element') or separate elements ([cardNumber](https://stripe.com/docs/js/elements_object/create_element?type=cardNumber 'cardNumber'), [cardExpiry](https://stripe.com/docs/js/elements_object/create_element?type=cardExpiry 'cardExpiry'), [cardCvc](https://stripe.com/docs/js/elements_object/create_element?type=cardCvc 'cardCvc')).

##### Render a Stripe card element

```javascript
import swell from 'swell-js';

swell.init('my-store', 'pk_...');

swell.payment.createElements({
  card: {
    elementId: '#card-element-id', // default: #card-element
    options: {
      // options are passed as a direct argument to stripe.js
      style: {
        base: {
          fontWeight: 500,
          fontSize: '16px',
        },
      },
    },
    onSuccess: (result) => {
      // optional, called on card payment success
    },
    onError: (error) => {
      // optional, called on card payment error
    },
  },
});
```

##### Render other Stripe elements

```javascript
import swell from 'swell-js';

swell.init('my-store', 'pk_...');

swell.payment.createElements({
  card: {
    separateElements: true, // required for separate elements
    cardNumber: {
      elementId: '#card-number-id', // default: #cardNumber-element
      options: {
        // options are passed as a direct argument to stripe.js
        style: {
          base: {
            fontWeight: 500,
            fontSize: '16px',
          },
        },
      },
    },
    cardExpiry: {
      elementId: '#card-expiry-id', // default: #cardExpiry-element
    },
    cardCvc: {
      elementId: '#card-expiry-id', // default: #cardCvc-element
    },
    onSuccess: (result) => {
      // optional, called on card payment success
    },
    onError: (error) => {
      // optional, called on card payment error
    },
  },
});
```

Note: see Stripe documentation for [options](https://stripe.com/docs/js/elements_object/create_element?type=card#elements_create-options 'options') and [customization](https://stripe.com/docs/js/appendix/style?type=card 'customization').

#### PayPal button

Render a PayPal checkout button.

```javascript
import swell from 'swell-js';

swell.init('my-store', 'pk_...');

swell.payment.createElements({
  paypal: {
    elementId: '#element-id', // default: #paypal-button
    style: {
      layout: 'horizontal', // optional
      color: 'blue',
      shape: 'rect',
      label: 'buynow',
      tagline: false,
    },
    onSuccess: (data, actions) => {
      // optional, called on payment success
    },
    onCancel: () => {
      // optional, called on payment cancel
    },
    onError: (error) => {
      // optional, called on payment error
    },
  },
});
```

Note: see [PayPal documentation](https://developer.paypal.com/docs/checkout/integration-features/customize-button/) for details on available style parameters.

#### Tokenize payment elements

When using a payment element such as `card` with Stripe, it's necessary to tokenize card details before submitting a payment form. Note: Some payment methods such as PayPal will auto-submit once the user completes authorization via PayPal, but tokenizing is always required for credit card elements.

If successful, `tokenize()` will automatically update the cart with relevant payment details. Otherwise, returns a validation error.

```javascript
import swell from 'swell-js';

swell.init('my-store', 'pk_...');

swell.payment.createElements({
  card: {
    ...
  },
});

const form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();
  showLoading();

  const result = await swell.payment.tokenize();

  hideLoading();

  if (result.error) {
    // inform the customer there was an error
  } else {
    // finally submit the form
    form.submit();
  }
});
```

## Direct credit card tokenization

If a <a href="#payment-elements">payment element</a> isn't available for your credit card processor, you can tokenize credit card information directly.

#### Create a card token

Returns an object representing the card token. Pass the token ID to a cart's `billing.card.token` field to designate this card as the payment method.

```javascript
const response = await swell.card.createToken({
  number: '4242 4242 4242 4242',
  exp_month: 1,
  exp_year: 2099,
  cvc: 321,
  // Note: some payment gateways may require a Swell `account_id` and `billing` for card verification (Braintree)
  account_id: '5c15505200c7d14d851e510f',
  billing: {
    address1: '1 Main Dr.',
    zip: 90210,
    // Other standard billing fields optional
  },
});
```

##### Successful token response

```javascript
{
  token: 't_z71b3g34fc3',
  brand: 'Visa',
  last4: '4242',
  exp_month: 1,
  exp_year: 2029,
  cvc_check: 'pass', // fail, checked
  zip_check: 'pass', // fail, checked
  address_check: 'pass', // fail, checked
}
```

##### Error token response

```javascript
{
  errors: {
    gateway: {
      code: 'TOKEN_ERROR',
      message: 'Declined',
      params: {
        cvc_check: 'fail',
        zip_check: 'pass',
        address_check: 'unchecked',
      },
    },
  },
}
```

#### Validate card number

Returns `true` if the card number is valid, otherwise `false`.

```javascript
swell.card.validateNumber('4242 4242 4242 4242'); // => true
swell.card.validateNumber('1111'); // => false
```

#### Validate card expiry

Returns `true` if the card expiration date is valid, otherwise `false`.

```javascript
swell.card.validateExpry('1/29'); // => true
swell.card.validateExpry('1/2099'); // => true
swell.card.validateExpry('9/99'); // => false
```

#### Validate CVC code

Returns `true` if the card CVC code is valid, otherwise `false`.

```javascript
swell.card.validateCVC('321'); // => true
swell.card.validateCVC('1'); // => false
```
