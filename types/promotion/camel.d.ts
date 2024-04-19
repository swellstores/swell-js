import { ConvertSnakeToCamelCase } from '..';
import { PromotionSnake, PromotionExclusionSnake } from './snake';

export type PromotionExclusionCamel =
  ConvertSnakeToCamelCase<PromotionExclusionSnake>;

export type PromotionCamel = ConvertSnakeToCamelCase<PromotionSnake>;
