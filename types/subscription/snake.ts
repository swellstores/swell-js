import type { BaseModel, ItemDiscount, ResultsResponse, Tax } from '../index';

import type { Account } from '../account';
import type { CartItemOptions, CartItemPurchaseOption } from '../cart';
import type { Product, Variant } from '../product';
import type { Discount } from '../discount';
import type { Payment } from '../payment';
import type { Invoice } from '../invoice';
import type { Billing } from '../billing';
import type { Coupon } from '../coupon';
import type { Refund } from '../refund';
import type { Order } from '../order';

export interface SubscriptionItem {
  id: string;
  description?: string;
  discount_total?: number;
  discount_each?: number;
  discounts?: ItemDiscount[];
  proration?: boolean;
  price?: number;
  price_total?: number;
  quantity?: number;
  purchase_option?: CartItemPurchaseOption;
  recurring_price?: number;
  recurring_price_total?: number;
  recurring_discount_total?: number;
  recurring_discount_each?: number;
  recurring_tax_total?: number;
  recurring_tax_each?: number;
  tax_total?: number;
  tax_each?: number;
}

export interface SubscriptionOrderSchedule {
  interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval_count?: number;
  limit?: number;
  limit_current?: number;
  date_limit_end?: string;
}

export interface SubscriptionBillingSchedule extends SubscriptionOrderSchedule {
  trial_days?: number;
}

export interface Subscription extends BaseModel {
  account?: Account;
  account_id?: string;
  active?: boolean;
  billing?: Billing;
  billing_schedule?: SubscriptionBillingSchedule;
  bundle_item_id?: string;
  coupon?: Coupon;
  coupon_id?: string;
  coupon_code?: string;
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
  discount_total?: number;
  discounts?: Discount[];
  draft?: boolean;
  grand_total?: number;
  interval?: 'monthly' | 'yearly' | 'weekly' | 'daily';
  interval_count?: number;
  invoices?: ResultsResponse<Invoice>;
  invoice_total?: number;
  item_discount?: number;
  item_tax?: number;
  item_total?: number;
  items?: SubscriptionItem[];
  number?: string;
  notes?: string;
  options?: CartItemOptions[];
  order_id?: string;
  order_item_id?: string;
  order_schedule?: SubscriptionOrderSchedule;
  orders?: ResultsResponse<Order>;
  ordering?: boolean;
  paid?: boolean;
  payments?: ResultsResponse<Payment>;
  payment_balance?: number;
  payment_total?: number;
  pending_invoices?: ResultsResponse<Invoice>;
  plan_id?: string;
  plan_name?: string;
  price?: number;
  price_total?: number;
  product?: Product;
  product_id?: string;
  product_name?: string;
  product_discount_each?: number;
  product_discount_total?: number;
  product_discounts?: ItemDiscount[];
  product_tax_each?: number;
  product_tax_total?: number;
  product_taxes?: Tax[];
  prorated?: boolean;
  quantity?: number;
  recurring_discount_total?: number;
  recurring_item_discount?: number;
  recurring_item_tax?: number;
  recurring_item_total?: number;
  recurring_tax_included_total?: number;
  recurring_tax_total?: number;
  recurring_total?: number;
  refunds?: ResultsResponse<Refund>;
  refund_total?: number;
  status?:
    | 'pending'
    | 'active'
    | 'trial'
    | 'pastdue'
    | 'unpaid'
    | 'canceled'
    | 'paid'
    | 'complete'
    | 'draft'
    | 'paused';
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
