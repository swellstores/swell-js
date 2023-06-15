import {
  BaseModel,
  CartGiftCardItem,
  CartItemOption,
  CartShipping,
  Discount,
  Tax,
} from '../index';
import { Product, Variant } from '../product';
import { Subscription } from '../subscription';
import { Account } from '../account';
import { Order } from '../order';
import { Coupon } from '../coupon';
import { Billing } from '../billing';
import { Promotion } from '../promotion';
import { PurhcaseLink } from '../purchase_link';
import { ShipmentRating } from '../shipment_rating';

interface CartItemOptionsSnake {
  id?: string;
  name?: string;
  price?: number;
  shipment_weight: number;
  value?: string;
  variant?: boolean;
}

interface CartGiftCardItemSnake {
  id?: string;
  amount?: number;
  code?: string;
  code_formatted?: string;
  giftcard?: string;
  last4?: string;
}

interface CartItemSnake extends BaseModel {
  bundle_items?: object[];
  delivery?: 'shipment' | 'subscription' | 'giftcard' | null;
  description?: string;
  discount_each?: number;
  discount_total?: number;
  discounts?: Discount[];
  metadata?: object;
  options?: CartItemOption[];
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
  taxes?: Tax[];
  trial_price_total?: number;
  variant_id?: string;
  variant?: Variant;
}

interface CartShippingSnake {
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
  account_address?: any;
  pickup?: boolean;
}

interface CartSnake extends BaseModel {
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
  grand_total?: number;
  guest?: boolean;
  item_discount?: number;
  item_quantity?: number;
  item_shipment_weight?: number;
  item_tax?: number;
  item_tax_included?: boolean;
  items?: CartItemSnake[];
  metadata?: object;
  notes?: string;
  number?: string;
  order?: Order;
  order_id?: string;
  orig_price?: number;
  promotion_ids?: any[];
  promotions?: Promotion[];
  purchase_link_ids?: string[];
  purchase_links?: PurhcaseLink[];
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
