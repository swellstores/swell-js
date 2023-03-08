import { Account } from '../account';
import { BaseModel, Discount, Payment, SubscriptionBillingSchedule, Tax } from '../index';
import { Product, Variant } from '../product';
import { Invoice } from '../invoice';
import { Billing } from '../billing';
import { Coupon } from '../coupon';
import { Refund } from '../refund';

interface SubscriptionItems extends BaseModel {
  date_created?: string;
  description?: string;
  discount_total?: number;
  discount_each?: number;
  id?: string;
  proration?: boolean;
  price?: number;
  price_total?: number;
  quantity?: number;
  recurring_price?: number;
  recurring_price_total?: number;
  recurring_discount_total?: number;
  recurring_discount_each?: number;
  recurring_tax_total?: number;
  recurring_tax_each?: number;
  tax_total?: number;
  tax_each?: number;
}

interface SubscriptionBillingScheduleSnake {
  interval?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval_count?: number
  trial_days?: number
  limit?: number
  limit_current?: number
  date_limit_end?: string
}

interface SubscriptionSnake extends BaseModel {
  account_id?: string;
  account?: Account;
  active?: boolean;
  billing?: Billing;
  billing_schedule?: SubscriptionBillingSchedule;
  bundle_item_id?: string;
  coupon?: Coupon;
  coupon_code?: string;
  coupon_id?: string;
  cancel_at_end?: boolean;
  cancel_reason?: string;
  canceled?: boolean;
  currency?: string;
  currency_rate?: string;
  complete?: boolean;
  date_canceled?: string;
  date_order_cycle_start?: string;
  date_order_period_end?: string;
  date_order_period_start?: string;
  date_payment_expiring?: string;
  date_payment_failed?: string;
  date_payment_retry?: string;
  date_period_end?: string;
  date_period_start?: string;
  date_prorated?: string;
  date_resumed?: string;
  date_trial_end?: string;
  date_trial_start?: string;
  date_updated?: string;
  discount_total?: number;
  discounts?: Discount[];
  draft?: boolean;
  grand_total?: number;
  interval?: 'monthly' | 'yearly' | 'weekly' | 'daily';
  interval_count?: number;
  invoices?: Invoice[];
  invoice_total?: number;
  item_discount?: number;
  item_tax?: number;
  item_total?: number;
  items?: SubscriptionItems[];
  number?: string;
  product_id?: string;
  notes?: string;
  options?: object[];
  order_id?: string;
  order_item_id?: string;
  order_schedule?: string;
  orders?: object[];
  ordering?: boolean;
  paid?: boolean;
  payments?: Payment[];
  payment_balance?: number;
  payment_total?: number;
  pending_invoices?: Invoice[];
  plan_id?: string;
  plan_name?: string;
  price?: number;
  price_total?: number;
  product?: Product;
  product_discount_each?: number;
  product_discount_total?: number;
  product_discounts?: number;
  product_tax_each?: number;
  product_tax_total?: number;
  product_taxes?: number;
  product_name?: string;
  prorated?: boolean;
  quantity?: number;
  recurring_discount_total?: number;
  recurring_item_discount?: number;
  recurring_item_tax?: number;
  recurring_item_total?: number;
  recurring_tax_included_total?: number;
  recurring_tax_total?: number;
  recurring_total?: number;
  refunds?: Refund;
  refund_total?: number;
  status?:
  | 'pending'
  | 'active'
  | 'trial'
  | 'pastdue'
  | 'unpaid'
  | 'canceled'
  | 'paid'
  | 'complete';
  sub_total?: number;
  tax_included_total?: number;
  tax_total?: number;
  taxes?: Tax[];
  taxes_fixed?: boolean;
  trial?: boolean;
  trial_days?: number;
  unpaid?: boolean;
  variant?: Variant;
  variant_id?: string;
}
