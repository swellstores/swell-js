import type { BaseModel, ResultsResponse } from '../index.js';

import type { Coupon } from '../coupon/index.js';
import type { CartItem } from '../cart/index.js';
import type { Promotion } from '../promotion/index.js';
import type { Discount } from '../discount/index.js';

export interface PurchaseLink extends BaseModel {
  name?: string;
  active?: boolean;
  coupon?: Coupon;
  coupon_id?: string;
  currency?: string;
  discount_total?: number;
  discounts?: Discount[];
  grand_total?: number;
  item_discount?: number;
  items?: CartItem[];
  metadata?: unknown;
  promotions?: ResultsResponse<Promotion>;
  promotion_ids?: string[];
  sub_total?: number;
}
