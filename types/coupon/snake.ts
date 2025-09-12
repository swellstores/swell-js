import type { BaseModel } from '../index';

import type { Discount } from '../discount';

export interface Coupon extends BaseModel {
  name?: string;
  description?: string;
  active?: boolean;
  date_valid?: string;
  date_expired?: string;
  discounts?: Discount[];
}
