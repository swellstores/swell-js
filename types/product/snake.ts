import type { BaseModel, ResultsResponse, Image } from '../index';

import type { Attribute } from '../attribute';
import type {
  SubscriptionBillingSchedule,
  SubscriptionOrderSchedule,
} from '../subscription';

export type SubscriptionInterval = 'monthly' | 'daily' | 'weekly' | 'yearly';

export interface ContentObject {
  [key: string]: unknown;
}

export interface Bundle {
  id?: string;
  product_id?: string;
  product?: Product;
  product_name?: string;
  quantity?: number;
  variant_id?: string;
  variant?: Variant;
}

export interface CrossSell {
  discount_type?: string;
  discount_amount?: number;
  discount_percent?: number;
  id?: string;
  product_id?: string;
  product?: Product;
}

export interface OptionValue {
  color?: string;
  description?: string;
  id?: string;
  image?: Image;
  images?: Image[];
  name?: string;
  price?: number;
  shipment_weight?: number;
  /** @deprecated */
  subscription_interval?: SubscriptionInterval;
  /** @deprecated */
  subscription_interval_count?: number;
  /** @deprecated */
  subscription_trial_days?: number;
}

export interface ProductOption {
  active?: boolean;
  attribute_id?: string;
  description?: string;
  id?: string;
  input_hint?: string;
  input_multi?: boolean;
  input_type?:
    | 'text'
    | 'textarea'
    | 'select'
    | 'multi_select'
    | 'file'
    | 'multi_file';
  name?: string;
  parent_id?: string;
  parent_value_ids?: string[];
  price?: number;
  required?: boolean;
  subscription?: boolean;
  variant?: boolean;
  values?: OptionValue[];
}

export interface Upsell {
  product?: string;
  product_id?: string;
}

export interface Price {
  account_group?: string;
  price?: number;
  quantity_max?: number;
  quantity_min?: number;
}

export interface StandardPurchaseOption {
  id?: string;
  name?: string;
  description?: string;
  active?: boolean;
  price?: number;
  sale?: boolean;
  sale_price?: number;
  orig_price?: number;
  prices?: Price[];
  account_groups?: string[];
}

export interface SubscriptionPlan {
  id?: string;
  name?: string;
  description?: string;
  active?: boolean;
  price?: number;
  billing_schedule?: SubscriptionBillingSchedule;
  order_schedule?: SubscriptionOrderSchedule;
}

export interface SubscriptionPurchaseOption {
  id?: string;
  name?: string;
  description?: string;
  active?: boolean;
  account_groups?: string[];
  plans?: SubscriptionPlan[];
}

export interface PurchaseOptions {
  standard?: StandardPurchaseOption;
  subscription?: SubscriptionPurchaseOption;
}

export interface Variant extends BaseModel {
  active?: boolean;
  archived?: boolean;
  attributes?: Attribute[];
  code?: string;
  cost?: number;
  currency?: string;
  name?: string;
  images?: Image[];
  option_value_ids?: string[];
  orig_price?: number;
  parent?: Product;
  parent_id?: string;
  price?: number;
  prices?: Price[];
  purchase_options?: PurchaseOptions;
  sku?: string;
  stock_level?: number;
  /** @deprecated use `purchase_options.subscription` instead */
  subscription_interval?: SubscriptionInterval;
  /** @deprecated use `purchase_options.subscription` instead */
  subscription_interval_count?: number;
  /** @deprecated use `purchase_options.subscription` instead */
  subscription_trial_days?: number;
}

export interface Product extends BaseModel {
  active?: boolean;
  attributes?: Record<string, Attribute>;
  bundle?: boolean;
  bundle_items?: Bundle[];
  category?: unknown;
  category_id?: string;
  categories?: unknown[];
  category_index?: {
    id?: string;
    sort?: object;
  };
  code?: string;
  cost?: number;
  content?: ContentObject;
  cross_sells?: CrossSell[];
  currency?: string;
  customizable?: boolean;
  delivery?: 'shipment' | 'subscription' | 'giftcard' | 'null';
  description?: string;
  discontinued?: boolean;
  images?: Image[];
  meta_description?: string;
  meta_title?: string;
  meta_keywords?: string;
  name: string;
  options?: ProductOption[];
  orig_price?: number;
  price?: number;
  prices?: Price[];
  purchase_options?: PurchaseOptions;
  quantity_min?: number;
  quantity_inc?: number;
  related_product_ids?: string[];
  sale?: boolean;
  sale_price?: number;
  shipment_dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: 'in' | 'cm';
  };
  shipment_location?: string;
  sku?: string;
  slug?: string;
  stock_level?: number;
  stock_purchasable?: boolean;
  stock_status?:
    | 'discontinued'
    | 'preorder'
    | 'backorder'
    | 'in_stock'
    | 'out_of_stock'
    | null;
  stock_tracking?: boolean;
  tags?: string[];
  type?: 'standard' | 'subscription' | 'bundle' | 'giftcard';
  up_sells?: Upsell[];
  variable?: boolean;
  variants?: ResultsResponse<Variant>;
  virtual?: boolean;
}
