import type { BaseModel, ResultsResponse } from '../index';

import type { Account } from '../account';
import type { Subscription } from '../subscription';
import type { Giftcard } from '../giftcard';
import type { Invoice } from '../invoice';
import type { Refund } from '../refund';
import type { Order } from '../order';
import type { Card } from '../card';

export interface Payment extends BaseModel {
  account?: Account;
  account_id?: string;
  account_card?: Card;
  account_card_id?: string;
  amazon?: object;
  amount: number;
  amount_refundable?: number;
  amount_refunded?: number;
  async?: boolean;
  authorized?: boolean;
  captured?: boolean;
  card?: Card;
  currency?: string;
  currency_rate?: number;
  date_async_update?: string;
  error?: object;
  gateway?: string;
  giftcard?: Giftcard;
  giftcard_id?: string;
  intent?: object;
  invoice?: Invoice;
  invoice_id?: string;
  method: string;
  number?: string;
  order?: Order;
  order_id?: string;
  paypal?: object; // TODO: Add Paypal Object
  refunds?: ResultsResponse<Refund>;
  status?: 'pending' | 'error' | 'success' | 'authorized';
  subscription?: Subscription;
  subscription_id?: string;
  success?: boolean;
  test?: boolean;
  transaction_id?: string;
}
