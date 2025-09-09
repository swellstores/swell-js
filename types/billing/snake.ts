import type { Card } from '../card';

export interface Billing {
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

export interface BillingAffirm {
  checkout_token?: string;
}

export interface BillingResolve {
  charge_id?: string;
}

export interface BillingKlarna {
  source?: string;
}

export interface BillingIdeal {
  token?: string;
}

export interface BillingBancontact {
  source?: string;
}

export interface BillingGoogle {
  nonce?: string;
  gateway?: string;
}

export interface BillingApple {
  nonce?: string;
  gateway?: string;
}
