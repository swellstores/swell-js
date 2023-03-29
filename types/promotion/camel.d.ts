import { SnakeToCamelCase } from '..';
import { PromotionSnake } from './snake';

export type PromotionCamel = {
  [K in keyof PromotionSnake as SnakeToCamelCase<K>]: PromotionSnake[K];
};
