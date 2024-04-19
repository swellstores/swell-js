import { ConvertSnakeToCamelCase } from '..';

import {
  DiscountRuleBuyGetProductSnake,
  DiscountRuleBuyGetCategorySnake,
  DiscountRuleSnake,
  DiscountSnake,
} from './snake';

export type DiscountRuleBuyGetItemCamel =
  | ConvertSnakeToCamelCase<DiscountRuleBuyGetProductSnake>
  | ConvertSnakeToCamelCase<DiscountRuleBuyGetCategorySnake>;

export type DiscountRuleCamel = ConvertSnakeToCamelCase<DiscountRuleSnake>;
export type DiscountCamel = ConvertSnakeToCamelCase<DiscountSnake>;
