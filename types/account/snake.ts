import type { BaseModel, ResultsResponse } from '..';

import type { Subscription } from '../subscription';
import type { Card } from '../card';
import type { Order } from '../order';
import type { Billing } from '../billing';

export interface PasswordTokenInput {
  password_token?: string;
}

export interface Account extends BaseModel {
  addresses?: ResultsResponse<Address>;
  balance?: number;
  billing?: Billing;
  cards?: ResultsResponse<Card>;
  date_first_order?: string;
  date_last_order?: string;
  email?: string;
  email_optin?: boolean;
  first_name?: string;
  group?: string;
  last_name?: string;
  metadata?: object;
  name?: string;
  orders?: ResultsResponse<Order>;
  order_count?: number;
  order_value?: number;
  password?: string;
  password_reset_url?: string;
  phone?: string;
  shipping?: Address;
  subscriptions?: ResultsResponse<Subscription>;
  type?: string;
  vat_number?: string;
}

export interface Address extends BaseModel {
  account_address_id?: string;
  active?: boolean;
  address1: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  fingerprint?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  parent_id?: string;
  phone?: string;
  state?: string;
  zip?: string;
}
