import { BaseModel } from '..';
import { Subscription } from '../subscription';
import { Card } from '../card';
import { Order } from '../order';

interface PasswordTokenInputSnake {
  password_token?: string;
}

interface AccountSnake extends BaseModel {
  addresses?: AddressSnake[];
  balance?: number;
  billing?: AddressSnake;
  cards?: Card[];
  date_first_order?: string;
  date_last_order?: string;
  email?: string;
  email_optin?: boolean;
  first_name?: string;
  group?: string;
  last_name?: string;
  metadata?: object;
  name?: string;
  orders?: Order[];
  order_count?: number;
  order_value?: number;
  password?: string;
  password_reset_url?: string;
  phone?: string;
  shipping?: AddressSnake;
  subscriptions?: Subscription[];
  type?: string;
  vat_number?: string;
}

interface AddressSnake extends BaseModel {
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
