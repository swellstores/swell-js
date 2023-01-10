import { SnakeToCamelCase } from '..';
import { CartSnake, CartItemSnake } from './snake';

export type CartCamel = {
  [K in keyof CartSnake as SnakeToCamelCase<K>]: CartSnake[K];
};
export type CartItemCamel = {
  [K in keyof CartItemSnake as SnakeToCamelCase<K>]: CartItemSnake[K];
};
