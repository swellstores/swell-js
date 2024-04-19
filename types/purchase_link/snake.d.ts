import { BaseModel, ResultsResponse } from '..';

import { Coupon } from '../coupon';
import { CartItem } from '../cart';
import { Promotion } from '../promotion';
import { Discount } from '../discount';

export interface PurchaseLinkSnake extends BaseModel {
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
