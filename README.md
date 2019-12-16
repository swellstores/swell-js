# Swell JS

The Swell JS library is a wrapper around the Storefront API, which provides restricted access to store data for client-side applications.

> **Important:** This library implements a subset of the operations available using the <a href="https://swell.store/docs/api">Swell API</a> and uses a public key, making it safe to use anywhere. As secret keys provide full access to your store's data, you should only use them server-side via environment variables to prevent them from being exposed in your source code.

To better understand how this library works, read the <a href="https://swell.store/docs/api">Swell API docs</a>.

**Use cases**

- List product and category data
- Create, recover, and update shopping carts
- Create a checkout flow to convert a shopping cart to an order
- Create a subscription signup and billing flow
- Authenticate customers and allow them to edit account information, orders and subscriptions

## Installation

With npm

```bash
npm install swell-js --save
```

With Yarn

```bash
yarn add swell-js
```

## Configuration

The client is authenticated using your Store ID and public key. You can find these details in your dashboard under _Settings > API_.

**Basic**

```javascript
await swell.init('<store-id>', '<public_key>');
```

Note: `swell.auth()` was renamed to `swell.init()` in v1.3.0.

**With options**

If your application uses camelCase, you can set an flag to transform the API's snake_case responses. This works on request data you provide as well.

```javascript
const options = {
  useCamelCase: // true | false (default is false)
};

swell.init('<store-id>', '<public_key>', options)
```

## Example usage

The examples here use ES6 async/await syntax. For ES5, all methods return a promise.

```javascript
import swell from 'swell-js';

swell.init('my-store', 'pk_...');

await swell.products.list({
  category: 't-shirts',
  limit: 25,
  page: 1,
});
```

## Products

#### List products

Return a list of products, up to `limit` results. Max 100 per page.

```javascript
await swell.products.list({
  limit: 25,
  page: 1,
});
```

#### List products with variants

Return a list of products with active variants expanded, up to `limit` results. Max 100 per page.

```javascript
await swell.products.list({
  limit: 25,
  page: 1,
  expand: ['variants'],
});
```

#### List products by category

Return a list of products category slug, up to `limit` results. Max 100 per page.

```javascript
await swell.products.list({
  category: 't-shirts',
  limit: 25,
  page: 1,
});
```

#### Search products

Return a list of products by search, up to `limit` results. Max 100 per page. Search is performed using "and" syntax, where all words must be present in one or more fields of the product.

```javascript
await swell.products.list({
  search: 'blue jeans',
  limit: 25,
  page: 1,
});
```

#### Retrieve a product

Return a single product by slug.

```javascript
await swell.products.get('blue-shoes');
```

Or by ID.

```javascript
await swell.products.get('5c15505200c7d14d851e510f');
```

#### Get a product variation with selected options

Apply options to a product to resolve `price`, `sale_price`, `orig_price` and `stock_status` values related to the selected options. Typically you would <a href="#retrieve-a-product">retrieve a product</a> earlier in the page's lifecycle and pass it along with selected options to this method. Options can be either an array or an object with option name/value pairs.

Returns a new object with product and option values merged together.

```javascript
await swell.products.variation(product, {
  Size: 'Medium',
  Color: 'Turquoise',
});
```

## Categories

#### List categories

Return a list of product categories, up to `limit` results. Max 100 per page.

```javascript
await swell.categories.list({
  limit: 25,
  page: 1,
});
```

#### Retrieve a category

Return a single category by slug.

```javascript
await swell.categories.get('mens-shirts');
```

Or by ID.

```javascript
await swell.categories.get('5c15505200c7d14d851e510g');
```

## Shopping carts

#### Retrieve the cart

Retrieve the current cart, if one has been created with at least one item. Returns a cart object or `null` if no items have been added to the cart.

```javascript
await swell.cart.get();
```

#### Add an item

Add a single item to the cart. Returns the updated cart object. Item options can be either an array or an object with option name/value pairs.

```javascript
await swell.cart.addItem({
  product_id: '5c15505200c7d14d851e510f',
  quantity: 1,
  options: [
    {
      name: 'Color',
      value: 'Blue',
    },
  ],
});
```

#### Update an item

Update a single cart item by ID. Returns the updated cart object.

```javascript
await swell.cart.updateItem('5c15505200c7d14d851e510f', {
  quantity: 2,
});
```

#### Update all items

Update all items in the cart by replacing existing items. Returns the updated cart object.

```javascript
await swell.cart.setItems([
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

Removes a single item from the cart. Returns the updated cart object.

```javascript
await swell.cart.removeItem('5c15505200c7d14d851e510f');
```

#### Remove all items

Removes all items from the cart. Returns the updated cart object.

```javascript
await swell.cart.setItems([]);
```

#### Recover a cart

Normally used with an abandoned cart recovery email. Your email may have a link to your store with a `checkout_id` identifying the cart that was abandoned. Making this request will add the cart to the current session and mark it as `recovered`. Returns the recovered cart object.

```javascript
await swell.cart.recover('878663b2fb4175b128e40de428cd7b0c');
```

#### Update cart account info

Update the cart with customer account information. Returns the updated cart object.

An account is assigned to a cart by its email address. If the account has no password saved, then it's considered a guest checkout and the cart will have the property `guest=true`. On the other hand, if the account has a password saved, the cart will have the property `account_logged_in=false` which you can use to prompt the user to <a href="#login">log in</a> to continue. Once the account is logged in, then `account_logged_in` will be updated to `true`.

```javascript
await swell.cart.update({
  account: {
    email: 'customer@example.com',
    email_optin: true, // optional, indicates the customer wants to receive marketing emails
    password: 'example', // optional, will save the customer's password if one doesn't exist yet
  },
});
```

#### Update cart shipping info

Update the cart with customer shipping information. Returns the updated cart object.

```javascript
await swell.cart.update({
  shipping: {
    name: 'Ship to name',
    address1: '...',
    address2: '...',
    city: '...',
    state: '...',
    zip: '...',
    country: '...',
    phone: '...',
  },
});
```

#### Update cart billing info

Update the cart with customer billing information. This method can update both shipping and billing at once if desired. Returns the updated cart object.

```javascript
await swell.cart.update({
  billing: {
    name: 'Bill to name',
    address1: '...',
    address2: '...',
    city: '...',
    state: '...',
    zip: '...',
    country: '...',
    phone: '...',
    // Using credit card
    card: {
      // Token from swell.card.createToken() or Stripe.js
      token: 'tok_...',
    },
    // Using PayPal
    paypal: {
      payer_id: '...',
      payment_id: '...',
    },
    // Using Amazon
    amazon: {
      access_token: '...',
      order_reference_id: '...',
    },
    // Using Affirm
    affirm: {
      checkout_token: '...',
    },
  },
});
```

Important note: At of February 2019, PayPal introduced Smart Payment Buttons while Swell's integration uses a previous version named checkout.js. This version continues to be supported by PayPal and Swell. For more details and examples, <a href="https://www.notion.so/swellstores/Swell-PayPal-integration-examples-e693bcb3cdeb435f91488bb9ed671a3e">see this document</a>.

#### Apply a coupon or gift card code

Apply either a coupon or gift card code, allowing you to have a single input for a code value. Coupon and gift card codes are not case sensitive. If successful, returns the updated cart object. Otherwise, returns a validation error.

```javascript
await swell.cart.applyCouponCode('FREESHIPPING');
```

#### Remove coupon code

Remove a coupon code if one was applied.

```javascript
await swell.cart.removeCouponCode();
```

#### Apply a gift card

Use this method to apply a gift card code only. You can apply any number of gift cards to a cart at once. Gift card codes are not case sensitive. If successful, returns the updated cart object. Otherwise, returns a validation error.

```javascript
await swell.cart.applyGiftcard('BUYS SFX4 BMZH YY7N');
```

#### Remove a gift card

Remove a gift card using the ID that was assigned to `cart.giftcards.id`.

```javascript
await swell.cart.removeGiftcard('5c15505200c7d14d851e51af');
```

#### Retrieve shipping rates

A shipment rating is contains all the available shipping services given the cart contents and shipping info. The cart must have at least `shipping.country` set before it will return a rating. Returns an object with shipping services and rates.

```javascript
await swell.cart.getShippingRates();
```

#### Submit an order

When a customer is finished checking out, call this method to convert a cart to an order. Returns the newly created order.

```javascript
await swell.cart.submitOrder();
```

#### Retrieve order details

You can retrieve order details after a cart is submitted. By default, this method will return the last order created by the current session. You can also retrieve an order using `checkout_id`, allowing you to display order details from an email containing an appropriate link, for example `https://example.com/order/{checkout_id}`.

```javascript
// Get the last order placed by the current session
await swell.cart.getOrder();

// Get an order by checkout_id
await swell.cart.getOrder('878663b2fb4175b128e40de428cd7b0c');
```

#### Retrieve checkout settings

Returns an object with settings that can affect checkout behavior.

- `name` - Name of the store
- `currency` - Store base currency
- `support_email` - Email address for customer support
- `fields` - Set of checkout fields to render as optional or required
- `scripts` - Custom scripts including script tags
- `accounts` - Indicates whether account login is `optional`, `disabled` or `required`
- `email_optin` - Indicates whether email newsletter opt-in should be presented as optional
- `terms_policy` - Store terms and conditions
- `refund_policy` - Store refund policy
- `privacy_policy` - Store privacy policy
- `theme` - Checkout theme settings
- `countries` - List of country codes that have shipping zones configured
- `payment_methods` - List of active payment methods
- `coupons` - Indicates whether the store has coupons
- `giftcards` - Indicates whether the store has gift cards

```javascript
await swell.cart.getSettings();
```


## Customer account

#### Login

If the email/password is correct, the account will be added to the session and make other related endpoints available to the client.

```javascript
await swell.account.login('customer@example.com', 'password');
```

#### Logout

This will remove the account from the current session and shopping cart.

```javascript
await swell.account.logout();
```

#### Retrieve logged in account

Returns the logged in account object, or `null` if the customer is not logged in.

```javascript
await swell.account.get();
```

#### Create a new account

Create a new customer account and log into the current session. Returns the newly created account object.

```javascript
await swell.account.create({
  email: 'customer@example.com',
  first_name: 'John', // optional
  last_name: 'Doe', // optional
  email_optin: true, // optional
  password: 'example',  // optional
});
```

#### Update a logged in account

Update the current logged in account, if possible. If successful, returns the updated account object. Otherwise, returns a validation error.

```javascript
await swell.account.update({
  email: 'updated@example.com',
  first_name: 'Jane', // optional
  last_name: 'Doe', // optional
  email_optin: false, // optional
  password: 'example',  // optional
});
```

#### Send a password reset email

Send a email to an existing customer account with a link to reset their password. If the email is not found, then no email will be sent. The call returns a value indicating success in either case.

```javascript
await swell.account.recover({
  email: 'customer@example.com',
});
```

#### Reset an account password

This requires a `reset_key` that is automatically generated when a recovery email is sent (see above). Your password recovery email should link to your web site with `reset_key` as a parameter for use in this call.

```javascript
await swell.account.recover({
  reset_key: '...',
  password: 'new password',
});
```

#### List addresses

Return a list of addresses on file for an account. These are stored automatically when a non-guest user checks out and chooses to save their information for later.

```javascript
await swell.account.getAddresses();
```

#### Create a new address

Create a new address entry for an account. Returns the newly created address object.

```javascript
await swell.account.createAddress({
  name: 'Ship to name',
  address1: '...',
  address2: '...',
  city: '...',
  state: '...',
  zip: '...',
  country: '...',
  phone: '...',
});
```

#### Delete an address

Remove an existing address entry from an account. Returns the deleted address object.

```javascript
await swell.account.deleteAddress('5c15505200c7d14d851e510f');
```

#### List saved credit cards

Return a list of saved credit cards an account. These are stored automatically when a non-guest user checks out and chooses to save their information for later.

```javascript
await swell.account.getCards();
```

#### Create a new credit card

Credit card tokens can be created using `swell.card.createToken` or Stripe.js.

```javascript
await swell.account.createCard({
  token: 't_...',
});
```

#### Delete a credit card

Remove an existing saved credit card from an account.

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

```javascript
await swell.account.getOrders({
  expand: 'shipments',
});
```

## Subscriptions

Fetch and manage subscriptions associated with the logged in customer's account.

#### Retrieve all subscriptions

Return a list of active and canceled subscriptions for an account.

```javascript
await swell.subscriptions.get();
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


## Credit card tokenization

In order to avoid PCI requirements.

#### Create a card token

Returns an object representing the card token. Pass the token ID to a cart's `billing.card.token` field to designate this card as the payment method.

```javascript
await swell.card.createToken({
  number: '4242 4242 4242 4242',
  exp_month: 1,
  exp_year: 2099,
  cvc: 321,
  // Note: some payment gateways require a Swell `account_id` (i.e. Braintree) for card verification
  account_id: '5c15505200c7d14d851e510f',
});
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
