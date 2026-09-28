import type { BaseModel, ResultsResponse } from '../index.js';

import type { Account } from '../account/index.js';
import type { Payment } from '../payment/index.js';
import type { Refund } from '../refund/index.js';
import type { Order } from '../order/index.js';

export interface GiftcardDebit extends BaseModel {
  amount?: number;
  payment?: Payment;
  payment_id?: string;
  refund?: Refund;
  refund_id?: string;
}

export interface Giftcard extends BaseModel {
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
