import { BaseModel } from '..';

import { Product } from '../product';
import { Discount } from '../discount';
import { Category } from '../category';

import { PromotionExclusion } from './index';

export interface PromotionExclusionSnake {
  id: string;
  type: 'product' | 'category';
  product?: Product;
  product_id?: string;
  category?: Category;
  category_id?: string;
}

export interface PromotionSnake extends BaseModel {
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
