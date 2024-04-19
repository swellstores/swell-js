import { DiscountRule, DiscountRuleBuyGetItem } from './index';

export interface DiscountRuleBuyGetProductSnake {
  product_id: string;
}

export interface DiscountRuleBuyGetCategorySnake {
  category_id: string;
}

export type DiscountRuleBuyGetItemSnake =
  | DiscountRuleBuyGetProductSnake
  | DiscountRuleBuyGetCategorySnake;

export interface DiscountRuleSnake {
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

export interface DiscountSnake {
  id: string;
  amount?: number;
  rule?: DiscountRule;
  type?: string;
}
