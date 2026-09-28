import type { BaseModel } from '../index.js';

import type { Order } from '../order/index.js';
import type { Payment } from '../payment/index.js';
import type { Subscription } from '../subscription/index.js';

export interface Refund extends BaseModel {
  amount?: number;
  currency?: string;
  currency_rate?: number;
  date_async_update?: string;
  error: {
    code?: string;
    message?: string;
  };
  method?: 'card' | 'account' | 'amazon' | 'paypal';
  number?: string;
  order?: Order;
  order_id?: string;
  parent: Payment;
  parent_id?: string;
  reason?: string;
  reason_message?: string;
  status?: string;
  subscription: Subscription;
  subscription_id?: string;
  success?: boolean;
  transaction_id?: string;
}
