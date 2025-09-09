export interface DiscountRuleBuyGetProduct {
  product_id: string;
}

export interface DiscountRuleBuyGetCategory {
  category_id: string;
}

export type DiscountRuleBuyGetItem =
  | DiscountRuleBuyGetProduct
  | DiscountRuleBuyGetCategory;

export interface DiscountRule {
  type?: 'total' | 'product' | 'category' | 'shipment' | 'buy_get';
  value_type?: 'fixed' | 'percent';
  value_fixed?: number;
  value_percent?: number;
  product_id?: string;
  category_id?: string;
  exclude_category_ids?: string | string[];
  quantity_min?: number;
  quantity_max?: number;
  quantity_add?: number;
  discount_max?: number;
  total_min?: number;
  get_total?: boolean;
  buy_items?: DiscountRuleBuyGetItem[];
  get_items?: DiscountRuleBuyGetItem[];
}

export interface Discount {
  id: string;
  amount?: number;
  rule?: DiscountRule;
  type?: string;
}
