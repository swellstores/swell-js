# Saferpay integration

Start by configuring a Saferpay account to Swell (Settings > Payments).

### Payment page initialization

To start a transaction, it is necessary to initialize the [Saferpay Payment Page](https://saferpay.github.io/jsonapi/index.html#ChapterPaymentPage).

#### Send an initialization request

```json
POST: /Payment/v1/PaymentPage/Initialize
{
  "RequestHeader": {
    "SpecVersion": "[current Spec-Version]",
    "CustomerId": "[your customer id]",
    "RequestId": "[unique request identifier]",
    "RetryIndicator": 0
  },
  "TerminalId": "[your terminal id]",
  "Payment": {
    "Amount": {
      "Value": "100",
      "CurrencyCode": "CHF"
    },
    "OrderId": "Id of the order",
    "Description": "Description of payment"
  },
  "RegisterAlias": { // Used to save and reuse a payment card
    "IdGenerator": "MANUAL",
    "Id": "[unique random value]"
  },
  "PaymentMethods": ["[card payment methods]"], // Swell currently only supports card payment methods
  "ReturnUrls": {
    "Success": "[your shop payment success url]",
    "Fail": "[your shop payment fail url]"
  }
}
```

See [Saferpay PaymentPage Initialize docs](https://saferpay.github.io/jsonapi/index.html#Payment_v1_PaymentPage_Initialize) for more details on configuring a payment page.

```json
RESPONSE
{
  "ResponseHeader": {
    "SpecVersion": "[current Spec-Version]",
    "RequestId": "Id of the request"
  },
  "Token": "234uhfh78234hlasdfh8234e1234",
  "Expiration": "2015-01-30T12:45:22.258+01:00",
  "RedirectUrl": "https://www.saferpay.com/vt2/api/..."
}
```

Save `Token` and `RedirectUrl` from the response for further payment processing.

#### Payment authorization

Redirect the customer to the payment page by `RedirectUrl` received during initialization, where the customer will select a payment method and enter the required information. When the customer enters the payment method data and authorizes it, the customer will be redirected to your store by URL that you specified when initializing the page (`ReturnUrls.Success`). In case of any error, there will be a redirect to the URL from `ReturnUrls.Fail`.

### Capture payment and create an order

After successfully redirecting the customer to your store, you need to save the payment method and capture the payment.

#### Send an assertion request

```json
POST: /Payment/v1/PaymentPage/Assert
{
  "RequestHeader": {
    "SpecVersion": "[current Spec-Version]",
    "CustomerId": "[your customer id]",
    "RequestId": "[unique request identifier]",
    "RetryIndicator": 0
  },
  "Token": "234uhfh78234hlasdfh8234e1234" // Pass the previously saved transaction token received during initialization
}
```

```json
RESPONSE
{
  ...
  "RegistrationResult": {
    "Alias": {
      "Id": "alias35nfd9mkzfw0x57iwx"
    }
  },
  "PaymentMeans": {
    "Brand": {
      "PaymentMethod": "VISA",
      "Name": "VISA Saferpay Test"
    },
    "DisplayText": "9123 45xx xxxx 1234",
    "Card": {
      "MaskedNumber": "912345xxxxxx1234",
      "ExpYear": 2015,
      "ExpMonth": 9,
      "HolderName": "Max Mustermann",
      "CountryCode": "CH"
    }
  }
}
```

#### Billing setup and order creation

Finally, add the relevant payment details to a Swell cart or order:

```js
const billing = {
  method: 'card',
  card: {
    token: RegistrationResult.Alias.Id,
    exp_month: PaymentMeans.Card.ExpMonth,
    exp_year: PaymentMeans.Card.ExpYear,
    brand: PaymentMeans.Brand.Name,
    last4: "[last 4 characters from 'PaymentMeans.Card.MaskedNumber']",
    gateway: 'saferpay',
  },
};

// Using Swell JS library
await swell.cart.update({ billing });
await swell.cart.submitOrder();

// Using Swell Node.js library
const cart = await swell.put('/carts/<id>', { billing });
await swell.post('/orders', { cart_id: cart.id });
```
