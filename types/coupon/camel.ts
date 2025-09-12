import type { ConvertSnakeToCamelCase } from '..';
import type { Replace } from '../utils';

import type { DiscountCamel } from '../discount/camel';

import type { Coupon } from './snake';

export type CouponCamel = ConvertSnakeToCamelCase<
  Replace<
    Coupon,
    {
      discounts?: DiscountCamel[];
    }
  >
>;
