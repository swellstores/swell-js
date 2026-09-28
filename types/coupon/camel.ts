import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type { DiscountCamel } from '../discount/camel.js';

import type { Coupon } from './snake.js';

export type CouponCamel = ConvertSnakeToCamelCase<
  Replace<
    Coupon,
    {
      discounts?: DiscountCamel[];
    }
  >
>;
