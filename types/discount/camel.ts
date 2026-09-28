import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type {
  DiscountRuleBuyGetProduct,
  DiscountRuleBuyGetCategory,
  DiscountRule,
  Discount,
} from './snake.js';

export type DiscountRuleBuyGetItemCamel =
  | ConvertSnakeToCamelCase<DiscountRuleBuyGetProduct>
  | ConvertSnakeToCamelCase<DiscountRuleBuyGetCategory>;

export type DiscountRuleCamel = ConvertSnakeToCamelCase<
  Replace<
    DiscountRule,
    {
      buy_items?: DiscountRuleBuyGetItemCamel[];
      get_items?: DiscountRuleBuyGetItemCamel[];
    }
  >
>;

export type DiscountCamel = ConvertSnakeToCamelCase<
  Replace<
    Discount,
    {
      rule?: DiscountRuleCamel;
    }
  >
>;
