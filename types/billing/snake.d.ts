import { Card } from '../card';

import {
  BillingAffirm,
  BillingKlarna,
  BillingIdeal,
  BillingBancontact,
  BillingGoogle,
  BillingApple,
} from './index';

export interface BillingSnake {
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
  card?: Omit<Card, 'billing'>;
  default?: boolean;
  account_card_id?: string;
  account_card?: Card;
  amazon?: unknown;
  paypal?: unknown;
  intent?: unknown;
  affirm?: BillingAffirm;
  klarna?: BillingKlarna;
  ideal?: BillingIdeal;
  bancontact?: BillingBancontact;
  google?: BillingGoogle;
  apple?: BillingApple;
}

export interface BillingAffirmSnake {
  checkout_token?: string;
}

export interface BillingResolveSnake {
  charge_id?: string;
}

export interface BillingKlarnaSnake {
  source?: string;
}

export interface BillingIdealSnake {
  token?: string;
}

export interface BillingBancontactSnake {
  source?: string;
}

export interface BillingGoogleSnake {
  nonce?: string;
  gateway?: string;
}

export interface BillingAppleSnake {
  nonce?: string;
  gateway?: string;
}
