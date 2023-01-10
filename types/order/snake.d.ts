import { BaseModel, Discount, Tax } from '../index';
import { Product, Variant } from '../product';
import { Subscription } from '../subscription';
import { Account } from '../account';
import { Payment } from '../payment';
import { Cart } from '../cart';
import { Order } from '.';

interface OrderItemSnake extends BaseModel {
  bundle_items?: [object];
  delivery?: 'shipment' | 'subscription' | 'giftcard' | null;
  description?: string;
  discount_each?: number;
  discount_total?: number;
  discounts?: [Discount];
  metadata?: object;
  options?: [object]; // TODO: Add Options Variant
  orig_price?: number;
  price?: number;
  price_total?: number;
  product_id?: string;
  product_name?: string;
  product?: Product;
  quantity?: number;
  shipment_location?: string;
  shipment_weight?: number;
  subscription_interval?: string;
  subscription_interval_count?: number;
  subscription_trial_days?: number;
  subscription_paid?: boolean;
  tax_each?: number;
  tax_total?: number;
  taxes?: [Tax];
  trial_price_total?: number;
  variant_id?: string;
  variant?: Variant;
}

interface OrderSnake extends BaseModel {
  account?: Account;
  account_credit_amount?: number;
  account_credit_applied?: boolean;
  account_id?: string;
  account_info_saved?: boolean;
  account_logged_in?: boolean;
  active?: boolean;
  authorized_payment?: Payment;
  authorized_payment_id?: string;
  billing?: object; // TODO: Billing Object
  cancel_reason?: string;
  canceled?: boolean;
  cart?: Cart;
  cart_id?: string;
  closed?: boolean;
  comments?: string;
  coupon?: object; // TODO: Create Coupon Object
  coupon_code?: string;
  coupon_id?: string;
  credit_total?: number;
  credits?: object[];
  currency?: string;
  currency_rate?: number;
  date_canceled?: string;
  date_payment_retry?: string;
  date_period_end?: string;
  date_period_start?: string;
  date_scheduled?: string;
  date_webhook_first_failed?: string;
  date_webhook_last_succeeded?: string;
  delivered?: boolean;
  delivery_marked?: boolean;
  discount_total?: number;
  discounts?: [object]; // TODO: Add discount object
  display_currency?: string;
  display_locale?: string;
  draft?: boolean;
  gift?: boolean;
  gift_message?: string;
  giftcard_delivery?: boolean;
  giftcard_total?: number;
  giftcards?: [object]; // TODO: Add gift card object
  grand_total?: number;
  guest?: boolean;
  hold?: boolean;
  invoices?: object[];
  item_discount?: number;
  item_quantity?: number;
  item_quantity_canceled?: number;
  item_quantity_creditable?: number;
  item_quantity_credited?: number;
  item_quantity_deliverable?: number;
  item_quantity_delivered?: number;
  item_quantity_giftcard_deliverable?: number;
  item_quantity_invoiceable?: number;
  item_quantity_invoiced?: number;
  item_quantity_returnable?: number;
  item_quantity_returned?: number;
  item_quantity_shipment_deliverable?: number;
  item_quantity_subscription_deliverable?: number;
  item_shipment_weight?: number;
  item_tax?: number;
  item_tax_included?: boolean;
  items?: [OrderItemSnake];
  metadata?: object;
  next?: Order;
  next_id?: string;
  notes?: string;
  number?: string;
  paid?: boolean;
  parent_id?: string;
  payment_balance?: number;
  payment_error?: string;
  payment_marked?: boolean;
  payment_retry_count?: number;
  payment_retry_resolve?: string;
  payment_total?: string;
  payments?: Payment[];
  pending_invoices?: object[];
  prev?: Order;
  prev_id?: string;
  promotion_ids?: [string];
  promotions?: [object]; // TODO: Create Promotion Object
  purchase_link_ids?: [string];
  purchase_links?: [object]; // TODO : Create Purchase Links
  purchase_links_errors?: [object];
  refund_marked?: boolean;
  refund_total?: number;
  refunded?: boolean;
  refunds?: object[];
  return_credit_tax?: number;
  return_credit_total?: number;
  return_item_tax?: number;
  return_item_tax_included?: number;
  return_item_total?: number;
  return_total?: number;
  schedule?: object;
  shipment_delivery?: boolean;
  shipment_discount?: number;
  shipment_price?: number;
  shipment_rating?: object; // TODO: Create Shipment Rating
  shipment_tax?: number;
  shipment_tax_included?: boolean;
  shipment_total?: number;
  shipment_total_credited?: number;
  shipments?: object[];
  shipping?: object; // TODO: Create Shipping Object
  status?:
    | 'pending'
    | 'draft'
    | 'payment_pending'
    | 'delivery_pending'
    | 'hold'
    | 'complete'
    | 'canceled';
  sub_total?: number;
  subscription?: Subscription;
  subscription_delivery?: boolean;
  subscription_id?: string;
  tax_included_total?: number;
  tax_total?: number;
  taxes?: [Tax];
  taxes_fixed?: boolean;
  test?: boolean;
  webhook_attempts_failed?: number;
  webhook_response?: string;
  webhook_status?: number;
}
