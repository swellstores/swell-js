import { SnakeToCamelCase } from '..';
import { CouponSnake } from './snake';

export type CouponCamel = {
  [K in keyof CouponSnake as SnakeToCamelCase<K>]: CouponSnake[K];
};
