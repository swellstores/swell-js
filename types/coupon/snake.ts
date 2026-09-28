import type { BaseModel } from '../index.js';

import type { Discount } from '../discount/index.js';

export interface Coupon extends BaseModel {
  name?: string;
  description?: string;
  active?: boolean;
  date_valid?: string;
  date_expired?: string;
  discounts?: Discount[];
}
