import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
} from '../index.js';
import type { Replace } from '../utils.js';

import type { CouponCamel } from '../coupon/camel.js';
import type { CartItemCamel } from '../cart/camel.js';
import type { PromotionCamel } from '../promotion/camel.js';
import type { DiscountCamel } from '../discount/camel.js';

import type { PurchaseLink } from './snake.js';

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
