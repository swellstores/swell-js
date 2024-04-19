import { BaseModel, ItemDiscount, Tax } from '../index';

import { Order, OrderShipping } from '../order';
import { Subscription } from '../subscription';
import { Discount } from '../discount';
import { Account } from '../account';
import { Product } from '../product';
import { Billing } from '../billing';
import { Coupon } from '../coupon';

export interface InvoiceItems {
  id?: string;
  delivery?: string;
  discount_total?: number;
  discount_each?: number;
  discounts?: ItemDiscount[];
  product_id?: string;
  product?: Product;
  price?: number;
  price_total?: number;
  quantity_creditable?: number;
  quantity_credited?: number;
  quantity?: number;
  tax_total?: number;
  tax_each?: number;
}

export interface InvoiceSnake extends BaseModel {
  account?: Account;
  account_id?: string;
  billing?: Billing;
  coupon?: Coupon;
  coupon_id?: string;
  coupon_code?: string;
  currency?: string;
  currency_rate?: string;
  date_due?: string;
  date_payment_retry?: string;
  date_period_end?: string;
  date_period_start?: string;
  date_updated?: string;
  discount_total?: number;
  discounts?: Discount[];
  grand_total?: number;
  shipping?: OrderShipping;
  subscription?: Subscription;
  subscription_id?: string;
  item_discount?: number;
  item_tax?: number;
  items?: InvoiceItems[];
  number?: string;
  notes?: string;
  order?: Order;
  order_id?: string;
  paid?: boolean;
  payment_total?: number;
  status?: 'pending' | 'void' | 'unpaid' | 'paid';
  sub_total?: number;
  tax_included_total?: number;
  tax_total?: number;
  taxes?: Tax[];
  taxes_fixed?: boolean;
  unpaid?: boolean;
  void?: boolean;
}
