import { BaseModel, ResultsResponse } from '../index';
import { Attribute } from '../attribute';
import { PurchaseOption } from './index';

interface ContentObject {
  [key: string]: string | number | boolean | null;
}

interface BundleSnake {
  id?: string;
  product_id?: string;
  product?: ProductSnake;
  product_name?: string;
  quantity?: number;
  variant_id?: string;
  variant?: VariantSnake;
}

interface CrossSellSnake {
  discount_type?: string;
  discount_amount?: number;
  discount_percent?: number;
  id?: string;
  product_id?: string;
  product?: ProductSnake;
}

interface OptionValueSnake {
  color?: string;
  description?: string;
  id?: string;
  image?: ImageSnake;
  images?: ImageSnake[];
  name?: string;
  price?: number;
  shipment_weight?: number;
  subscription_interval?: number;
  subscription_interval_count?: number;
  subscription_trial_days?: number;
}

interface ProductOptionSnake {
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
    | 'muti_file';
  name?: string;
  parent_id?: string;
  parent_value_ids?: string[];
  price?: number;
  required?: boolean;
  subscription?: boolean;
  variant?: boolean;
  values?: OptionValueSnake[];
}

interface UpsellSnake {
  product?: string;
  product_id?: string;
}

interface ImageSnake {
  caption?: string;
  file?: {
    content_type?: string;
    date_uploaded?: string;
    filename?: string;
    height?: number;
    length?: number;
    metadata?: object;
    md5?: string;
    private?: boolean;
    url?: string;
    width?: number;
  };
}

interface PriceSnake {
  account_group?: string;
  price?: number;
  quantity_max?: number;
  quantity_min?: number;
}

interface VariantSnake extends BaseModel {
  active?: boolean;
  archived?: boolean;
  attributes?: Attribute[];
  code?: string;
  cost?: number;
  currency?: string;
  name?: string;
  images?: ImageSnake[];
  option_value_ids?: string[];
  orig_price?: number;
  parent?: ProductSnake;
  parent_id?: string;
  price?: number;
  prices?: PriceSnake[];
  purchase_options?: PurchaseOption[];
  sku?: string;
  stock_level?: number;
  subscription_interval?: 'monthly' | 'yearly' | 'weekly' | 'daily';
  subscription_trial_days?: number;
}

export interface ProductSnake extends BaseModel {
  active?: boolean;
  attributes?: Attribute[];
  bundle?: boolean;
  bundle_items?: BundleSnake[];
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
  cross_sells?: CrossSellSnake[];
  currency?: string;
  customizable?: boolean;
  delivery?: 'shipment' | 'subscription' | 'giftcard' | 'null';
  description?: string;
  discontinued?: boolean;
  images?: ImageSnake[];
  meta_description?: string;
  meta_title?: string;
  meta_keywords?: string;
  name: string;
  options?: ProductOptionSnake[];
  orig_price?: number;
  price?: number;
  prices?: PriceSnake[];
  purchase_options?: PurchaseOption[];
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
  stock_status?: 'available' | 'preorder' | 'backorder';
  stock_tracking?: boolean;
  tags?: string[];
  up_sells?: UpsellSnake[];
  variable?: boolean;
  variants?: VariantSnake[];
  virtual?: boolean;
}
