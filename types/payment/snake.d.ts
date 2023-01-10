import { Account } from '../account';
import { Card } from '../card';
import { BaseModel } from '../index';
import { Order } from '../order';
import { Subscription } from '../subscription';

interface PaymentSnake extends BaseModel {
  account?: Account;
  account_card?: object; // TODO: Account Card
  account_card_id?: string;
  account_id?: string;
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
  giftcard?: object; // TODO: Add Gift Card
  giftcard_id?: string;
  intent?: object;
  invoice?: object; // TODO: Add Invoice Object
  invoice_id?: string;
  method: string;
  number?: string;
  order?: Order;
  order_id?: string;
  paypal?: object; //TODO: Add Paypal Object
  refunds?: [object]; // TODO: Add Refunds Object
  status?: 'pending' | 'error' | 'success' | 'authorized';
  subscription?: Subscription;
  subscription_id?: string;
  success?: boolean;
  test?: boolean;
  transaction_id?: string;
}
