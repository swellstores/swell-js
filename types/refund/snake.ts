import type { BaseModel } from '..';

import type { Order } from '../order';
import type { Payment } from '../payment';
import type { Subscription } from '../subscription';

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
