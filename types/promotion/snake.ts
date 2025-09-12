import type { BaseModel } from '..';

import type { Product } from '../product';
import type { Discount } from '../discount';
import type { Category } from '../category';

export interface PromotionExclusion {
  id: string;
  type: 'product' | 'category';
  product?: Product;
  product_id?: string;
  category?: Category;
  category_id?: string;
}

export interface Promotion extends BaseModel {
  name?: string;
  active?: boolean;
  currency?: string;
  date_end?: string;
  date_start?: string;
  description?: string;
  discount_group?: string;
  discounts?: Discount[];
  exclusions?: PromotionExclusion[];
  limit_account_groups?: string[];
  limit_account_uses?: number;
  limit_uses?: number;
  use_count?: number;
}
