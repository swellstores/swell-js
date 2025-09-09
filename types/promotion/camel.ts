import type { ConvertSnakeToCamelCase } from '..';
import type { Replace } from '../utils';

import type { ProductCamel } from '../product/camel';
import type { DiscountCamel } from '../discount/camel';
import type { CategoryCamel } from '../category/camel';

import type { Promotion, PromotionExclusion } from './snake';

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
