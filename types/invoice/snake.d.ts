import { Account } from '../account';
import { Order } from '../order';
import { BaseModel, Tax } from '../index';
import { Product } from '../product';
interface InvoiceItems extends BaseModel {
  delivery?: string;
  discount_total?: number;
  discount_each?: number;
  discounts?: [object]; // TODO: Create Discount type
  id?: string;
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

interface InvoiceSnake extends BaseModel {
  account_id?: string;
  account?: Account;
  billing?: object; // TODO: Add billing
  coupon?: object; // TODO: Add Coupon
  coupon_code?: string;
  coupon_id?: string;
  currency?: string;
  currency_rate?: string;
  date_due?: string;
  date_payment_retry?: string;
  date_period_end?: string;
  date_period_start?: string;
  date_updated?: string;
  discount_total?: number;
  discounts?: [object]; // TODO: Create Discount type
  grand_total?: number;
  shipping?: object; // TODO: Add shipping
  subscription_id?: string;
  item_discount?: number;
  item_tax?: number;
  items?: [InvoiceItems];
  number?: string;
  notes?: string;
  order_id?: string;
  order?: Order;
  paid?: boolean;
  payment_total?: number;
  status?: 'pending' | 'void' | 'unpaid' | 'paid';
  sub_total?: number;
  tax_included_total?: number;
  tax_total?: number;
  taxes?: [Tax];
  taxes_fixed?: boolean;
  unpaid?: boolean;
}
