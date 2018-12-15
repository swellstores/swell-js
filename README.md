# Storefront API

Client-side applications can use the Swell Storefront API to retrieve public data including products, shopping carts, and account information.

## Getting started

```bash
npm install swell-storefront --save
```

Basic example:

```javascript
import swell from 'swell-storefront';

swell.auth('my-store', 'pk_...');

swell.get('/products', {
  category: 't-shirts',
  limit: 25,
  page: 1,
}).then((products) => {
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
  options: [{
    id: 'color',
    value: 'Blue',
  }],
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
swell.cart.updateItems([{
  quantity: 2,
}, {
  quantity: 3,
}, {
  quantity: 4,
}]);
```

#### Remove an item

```javascript
swell.cart.removeItem('5c15505200c7d14d851e510f');
```

#### Remove all items

```javascript
swell.cart.removeItems();
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
