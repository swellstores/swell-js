import type { BaseModel, ResultsResponse } from '..';

import type { Coupon } from '../coupon';
import type { CartItem } from '../cart';
import type { Promotion } from '../promotion';
import type { Discount } from '../discount';

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
