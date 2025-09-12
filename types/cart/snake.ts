import type { BaseModel, ResultsResponse, Tax } from '../index';

import type { Product, Variant } from '../product';
import type { Account, Address } from '../account';
import type { Subscription } from '../subscription';
import type { Giftcard } from '../giftcard';
import type { Order } from '../order';
import type { Coupon } from '../coupon';
import type { Billing } from '../billing';
import type { Discount } from '../discount';
import type { Promotion } from '../promotion';
import type { PurchaseLink } from '../purchase_link';
import type { ShipmentRating } from '../shipment_rating';

export interface CartItemOptions {
  id?: string;
  name?: string;
  price?: number;
  shipment_weight?: number;
  value?: string;
  variant?: boolean;
}

export interface CartGiftCardItem {
  id?: string;
  amount?: number;
  code?: string;
  code_formatted?: string;
  last4?: string;
  giftcard?: Giftcard;
}

export interface CartItemOrderSchedule {
  interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval_count?: number;
  limit?: number;
}

export interface CartItemBillingSchedule extends CartItemOrderSchedule {
  trial_days?: number;
}

export interface CartItemPurchaseOption {
  type?: 'standard' | 'subscription' | 'trial';
  name?: string;
  price?: number;
  auth_amount?: number;
  trial_days?: number;
  plan_id?: string;
  plan_name?: string;
  plan_description?: string;
  billing_schedule?: CartItemBillingSchedule;
  order_schedule?: CartItemOrderSchedule;
}

export interface CartItem {
  id: string;
  bundle_items?: object[];
  delivery?: 'shipment' | 'subscription' | 'giftcard' | null;
  description?: string;
  discount_each?: number;
  discount_total?: number;
  discounts?: Discount[];
  metadata?: object;
  options?: CartItemOptions[];
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

export interface CartShipping {
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

export interface Cart extends BaseModel {
  abandoned?: boolean;
  abandoned_notifications?: number;
  account?: Account;
  account_credit_amount?: number;
  account_credit_applied?: boolean;
  account_id?: string;
  account_info_saved?: boolean;
  account_logged_in?: boolean;
  active?: boolean;
  billing?: Billing;
  checkout_id?: string;
  checkout_url?: string;
  comments?: string;
  coupon?: Coupon;
  coupon_code?: string;
  coupon_id?: string;
  currency?: string;
  currency_rate?: number;
  date_abandoned?: string;
  date_abandoned_next?: string;
  date_webhook_first_failed?: string;
  date_webhook_last_succeeded?: string;
  discount_total?: number;
  discounts?: Discount[];
  display_currency?: string;
  display_locale?: string;
  gift?: boolean;
  gift_message?: string;
  giftcard_delivery?: boolean;
  giftcard_total?: number;
  giftcards?: CartGiftCardItem[];
  capture_total?: number;
  grand_total?: number;
  guest?: boolean;
  item_discount?: number;
  item_quantity?: number;
  item_shipment_weight?: number;
  item_tax?: number;
  item_tax_included?: boolean;
  items?: CartItem[];
  metadata?: object;
  notes?: string;
  number?: string;
  order?: Order;
  order_id?: string;
  orig_price?: number;
  promotion_ids?: string[];
  promotions?: ResultsResponse<Promotion>;
  purchase_link_ids?: string[];
  purchase_links?: ResultsResponse<PurchaseLink>;
  purchase_links_errors?: object[];
  recovered?: boolean;
  schedule?: object;
  shipment_delivery?: boolean;
  shipment_discount?: number;
  shipment_price?: number;
  shipment_rating?: ShipmentRating;
  shipment_tax?: number;
  shipment_tax_included?: boolean;
  shipment_total?: number;
  shipping?: CartShipping;
  status?: 'active' | 'converted' | 'abandoned' | 'recovered';
  sub_total?: number;
  subscription?: Subscription;
  subscription_delivery?: boolean;
  subscription_id?: string;
  target_order?: Order;
  target_order_id?: string;
  tax_included_total?: number;
  tax_total?: number;
  taxes?: Tax[];
  taxes_fixed?: boolean;
  webhook_attempts_failed?: number;
  webhook_response?: string;
  webhook_status?: number;
}
