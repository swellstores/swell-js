import { BaseModel, ResultsResponse } from '../index';

import { Account } from '../account';
import { Payment } from '../payment';
import { Refund } from '../refund';
import { Order } from '../order';

import { GiftcardDebit } from './index';

export interface GiftcardDebitSnake extends BaseModel {
  amount?: number;
  payment?: Payment;
  payment_id?: string;
  refund?: Refund;
  refund_id?: string;
}

export interface GiftcardSnake extends BaseModel {
  code?: string;
  code_formatted?: string;
  last4?: string;
  amount?: number;
  amount_spent?: number;
  balance?: number;
  redeemed?: boolean;
  disabled?: boolean;
  date_expired?: string;
  send_email?: string;
  send_note?: string;
  account?: Account;
  account_id?: string;
  product_id?: string;
  order?: Order;
  order_id?: string;
  order_item_id?: string;
  bundle_item_id?: string;
  currency_rate?: number;
  debits?: ResultsResponse<GiftcardDebit>;
}
