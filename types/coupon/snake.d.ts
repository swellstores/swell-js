import { BaseModel } from '../index';

import { Discount } from '../discount';

export interface CouponSnake extends BaseModel {
  name?: string;
  description?: string;
  active?: boolean;
  date_valid?: string;
  date_expired?: string;
  discounts?: Discount[];
}
