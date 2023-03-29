import { BaseModel, CartItemOption, Discount, Tax } from '../index';

interface BillingSnake {
  name?: string;
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  method?: 'card' | 'account' | 'amazon' | 'paypal';
  card?: any;
  default?: boolean;
  account_card_id?: string;
  account_card?: any;
  amazon?: any;
  paypal?: any;
  intent?: any;
  affirm?: BillingAffirmSnake;
  klarna?: BillingKlarnaSnake;
  ideal?: BillingIdealSnake;
  bancontact?: BillingBancontactSnake;
  google?: BillingGoogleSnake;
  apple?: BillingAppleSnake;
}

interface BillingAffirmSnake {
  checkout_token?: string;
}

interface BillingResolveSnake {
  charge_id?: string;
}

interface BillingKlarnaSnake {
  source?: string;
}

interface BillingIdealSnake {
  token?: string;
}

interface BillingBancontactSnake {
  source?: string;
}

interface BillingGoogleSnake {
  nonce?: string;
  gateway?: string;
}

interface BillingAppleSnake {
  nonce?: string;
  gateway?: string;
}
