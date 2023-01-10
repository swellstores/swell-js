import { SnakeToCamelCase } from '..';
import { CategorySnake } from './snake';

export type CategoryCamel = {
  [K in keyof CategorySnake as SnakeToCamelCase<K>]: CategorySnake[K];
};
