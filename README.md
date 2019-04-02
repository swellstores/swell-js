# Storefront API Library

The storefront library is a wrapper around the Swell Storefront API, which provides restricted access to store data for client-side applications.

> **Important:** The Storefront and Checkout APIs restrict what operations are available and use public keys, making them safe to use anywhere. As secret keys provide full access to your store's data, you should only use them server-side and access them via environment variables/secrets to prevent them from being exposed in your source code.```

**Use cases**

- List product data
- Create, recover, and update shopping carts
- Authenticate customers and allow them to edit account information and subscriptions

For creating custom checkout flows, you can use the Swell Checkout API.

## Installation

With npm

```bash
npm install swell-storefront --save
```

With Yarn

```bash
yarn add swell-storefront
```

## Configuration

The client is authenticated using your Store ID and a public key. You can find these details in your dashboard under _Settings > API_.

If your application uses camelCase, you can set an flag to transform the API's snake_case responses. This works on request data you provide as well.

**Basic**

```javascript
swell.auth('<store-id>', '<public_key>');
```

**With options**

```javascript
const options = {
  useCamelCase: // true | false (default is false)
}

swell.auth('<store-id>', '<public_key>', options)
```

## Example usage

```javascript
import swell from 'swell-storefront';

swell.auth('my-store', 'pk_...');

swell
  .get('/products', {
    category: 't-shirts',
    limit: 25,
    page: 1,
  })
  .then((products) => {
    console.log(products);
  });
```

## Products

#### List products

```javascript
swell.get('/products', {
  limit: 25,
  page: 1,
});
```

#### List products with variants

```javascript
swell.get('/products', {
  limit: 25,
  page: 1,
  expand: ['variants'],
});
```

#### List products by category

```javascript
swell.get('/products', {
  category: 't-shirts',
  limit: 25,
  page: 1,
});
```

#### Search products

```javascript
swell.get('/products', {
  search: 'blue jeans',
  limit: 25,
  page: 1,
});
```

#### Get a product by slug

```javascript
swell.get('/products/{slug}', {
  slug: 'pink-shoes',
});
```

#### Get a product by ID

```javascript
swell.get('/products/{id}', {
  id: '5c15505200c7d14d851e510f',
});
```

## Categories

#### List categories

```javascript
swell.get('/categories');
```

## Shopping carts

#### Get the cart

This request will return `null` if nothing has been added to the cart yet.

```javascript
swell.cart.get();
```

#### Add an item

This request will return `null` if nothing has been added to the cart yet.

```javascript
swell.cart.addItem({
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

#### Update an item

```javascript
swell.cart.updateItem('5c15505200c7d14d851e510f', {
  quantity: 2,
});
```

#### Update all items

```javascript
swell.cart.setItems([
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
swell.cart.removeItem('5c15505200c7d14d851e510f');
```

#### Remove all items

```javascript
swell.cart.setItems([]);
```

#### Recover a shopping cart

This is typically used with an abandoned cart recovery email. Your email may have a link to your store with a `checkout_id` identifying the cart that was abandoned. Making this request will add the cart to the current session and mark it as `recovered`.

```javascript
swell.cart.recover('878663b2fb4175b128e40de428cd7b0c');
```

## Customer account

#### Login

If the email/password is correct, the account will be added to the session and make other related endpoints available to the client.

```javascript
swell.account.login('customer@example.com', 'password');
```

#### Logout

This will remove the account from the current session and shopping cart.

```javascript
swell.account.logout();
```

#### Get logged in account

```javascript
swell.account.get();
```

#### Create a new account

```javascript
swell.account.create({
  email: 'customer@example.com',
  first_name: 'John',
  last_name: 'Doe',
  email_optin: true,
});
```

#### Update logged in account

```javascript
swell.account.update({
  email: 'updated@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  email_optin: false,
});
```

#### Send password recovery email

```javascript
swell.account.recover({
  email: 'customer@example.com',
});
```

#### Recovery account password

```javascript
swell.account.recover({
  reset_key: '...',
  password: 'new password',
});
```

#### List addresses

```javascript
swell.account.getAddresses();
```

#### Create a new address

```javascript
swell.account.createAddress({
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

```javascript
swell.account.deleteAddress('5c15505200c7d14d851e510f');
```

#### List saved credit cards

```javascript
swell.account.getCards();
```

#### Create a new credit card

Credit card tokens can be created using Schema.js or Stripe.js.

```javascript
swell.account.createCard({
  token: 't_...',
});
```

#### Delete a credit card

```javascript
swell.account.deleteCard('5c15505200c7d14d851e510f');
```

## Subscriptions

Fetch and manage subscriptions associated with the logged in customer's account.

#### Get all subscriptions

```javascript
swell.subscriptions.get();
```

#### Get a subscription by ID

```javascript
swell.subscriptions.get(id);
```

#### Create a subscription

```javascript
swell.subscriptions.create({
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
swell.subscriptions.update('5c15505200c7d14d851e510f', {
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
swell.subscriptions.update('5c15505200c7d14d851e510f', {
  product_id: '5c15505200c7d14d851e510g',
  variant_id: '5c15505200c7d14d851e510h', // optional
  quantity: 2,
});
```

#### Cancel a subscription

```javascript
swell.subscriptions.update('5c15505200c7d14d851e510f', {
  canceled: true,
});
```

#### Add an invoice item

```javascript
swell.subscriptions.addItem('5c15505200c7d14d851e510f', {
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
swell.subscriptions.updateItem('5c15505200c7d14d851e510f', '<item_id>', {
  quantity: 2,
});
```

#### Update all invoice items

```javascript
swell.subscriptions.setItems('5c15505200c7d14d851e510e', [
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
swell.subscriptions.removeItem('5c15505200c7d14d851e510f', '<item_id>');
```

#### Remove all items

```javascript
swell.subscriptions.setItems([]);
```
