import { BaseModel, ItemDiscount, ResultsResponse, Tax } from '../index';

import { Cart, CartItemPurchaseOption } from '../cart';
import { Product, Variant } from '../product';
import { Account, Address } from '../account';
import { Giftcard } from '../giftcard';
import { Payment } from '../payment';
import { Billing } from '../billing';
import { Coupon } from '../coupon';
import { Discount } from '../discount';
import { Promotion } from '../promotion';
import { Subscription } from '../subscription';
import { PurchaseLink } from '../purchase_link';
import { ShipmentRating } from '../shipment_rating';

import {
  Order,
  OrderItem,
  OrderGiftCard,
  OrderOption,
  OrderShipping,
} from './index';

export interface OrderOptionSnake {
  id?: string;
  name?: string;
  price?: number;
  shipment_weight?: number;
  value?: string;
  variant?: boolean;
  value_id: string;
}

export interface OrderItemSnake extends BaseModel {
  bundle_items?: object[];
  delivery?: 'shipment' | 'subscription' | 'giftcard' | null;
  description?: string;
  discount_each?: number;
  discount_total?: number;
  discounts?: ItemDiscount[];
  metadata?: object;
  options?: OrderOption[];
  orig_price?: number;
  price?: number;
  price_total?: number;
  product_id?: string;
  product_name?: string;
  product?: Product;
  quantity?: number;
  purchase_option?: CartItemPurchaseOption;
  shipment_location?: string;
  shipment_weight?: number;
  /** @deprecated use `purchase_option` instead */
  subscription_interval?: string;
  /** @deprecated use `purchase_option` instead */
  subscription_interval_count?: number;
  /** @deprecated use `purchase_option` instead */
  subscription_trial_days?: number;
  subscription_paid?: boolean;
  tax_each?: number;
  tax_total?: number;
  taxes?: Tax[];
  trial_price_total?: number;
  variant_id?: string;
  variant?: Variant;
}

export interface OrderShippingSnake {
  name?: string;
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  service?: string;
  service_name?: string;
  price?: number;
  default?: boolean;
  account_address_id?: string;
  account_address?: Address;
  pickup?: boolean;
}

export interface OrderGiftCardSnake {
  id?: string;
  amount?: number;
  code?: string;
  code_formatted?: string;
  last4?: string;
  giftcard?: Giftcard;
}

export interface OrderSnake extends BaseModel {
  account?: Account;
  account_id?: string;
  account_credit_amount?: number;
  account_credit_applied?: boolean;
  account_info_saved?: boolean;
  account_logged_in?: boolean;
  active?: boolean;
  authorized_payment?: Payment;
  authorized_payment_id?: string;
  billing?: Billing;
  cancel_reason?: string;
  canceled?: boolean;
  cart?: Cart;
  cart_id?: string;
  closed?: boolean;
  comments?: string;
  coupon?: Coupon;
  coupon_id?: string;
  coupon_code?: string;
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
  discounts?: Discount[];
  display_currency?: string;
  display_locale?: string;
  draft?: boolean;
  gift?: boolean;
  gift_message?: string;
  giftcard_delivery?: boolean;
  giftcard_total?: number;
  giftcards?: OrderGiftCard[];
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
  items?: OrderItem[];
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
  payments?: ResultsResponse<Payment>;
  pending_invoices?: object[];
  prev?: Order;
  prev_id?: string;
  promotion_ids?: string[];
  promotions?: ResultsResponse<Promotion>;
  purchase_link_ids?: string[];
  purchase_links?: ResultsResponse<PurchaseLink>;
  purchase_links_errors?: object[];
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
  shipment_rating?: ShipmentRating;
  shipment_tax?: number;
  shipment_tax_included?: boolean;
  shipment_total?: number;
  shipment_total_credited?: number;
  shipments?: object[];
  shipping?: OrderShipping;
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
  subscription_id?: string;
  subscription_delivery?: boolean;
  tax_included_total?: number;
  tax_total?: number;
  taxes?: Tax[];
  taxes_fixed?: boolean;
  test?: boolean;
  webhook_attempts_failed?: number;
  webhook_response?: string;
  webhook_status?: number;
}
