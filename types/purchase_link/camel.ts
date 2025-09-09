import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';

import type { CouponCamel } from '../coupon/camel';
import type { CartItemCamel } from '../cart/camel';
import type { PromotionCamel } from '../promotion/camel';
import type { DiscountCamel } from '../discount/camel';

import type { PurchaseLink } from './snake';

export type PurchaseLinkCamel = ConvertSnakeToCamelCase<
  Replace<
    PurchaseLink,
    {
      coupon?: CouponCamel;
      discounts?: DiscountCamel[];
      items?: CartItemCamel[];
      promotions?: ResultsResponseCamel<PromotionCamel>;
    }
  >
>;
