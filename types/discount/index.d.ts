import {
  DiscountCamel,
  DiscountRuleCamel,
  DiscountRuleBuyGetItemCamel,
} from './camel';

import {
  DiscountSnake,
  DiscountRuleSnake,
  DiscountRuleBuyGetItemSnake,
} from './snake';

export type DiscountRuleBuyGetItem =
  | DiscountRuleBuyGetItemSnake
  | DiscountRuleBuyGetItemCamel;

export interface DiscountRule extends DiscountRuleSnake, DiscountRuleCamel {}
export interface Discount extends DiscountSnake, DiscountCamel {}
