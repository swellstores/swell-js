import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type { ProductCamel } from '../product/camel.js';
import type { DiscountCamel } from '../discount/camel.js';
import type { CategoryCamel } from '../category/camel.js';

import type { Promotion, PromotionExclusion } from './snake.js';

export type PromotionExclusionCamel = ConvertSnakeToCamelCase<
  Replace<
    PromotionExclusion,
    {
      product?: ProductCamel;
      category?: CategoryCamel;
    }
  >
>;

export type PromotionCamel = ConvertSnakeToCamelCase<
  Replace<
    Promotion,
    {
      discounts?: DiscountCamel[];
      exclusions?: PromotionExclusionCamel[];
    }
  >
>;
