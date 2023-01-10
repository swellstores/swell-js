import { SnakeToCamelCase } from '..';
import { OrderSnake, OrderItemSnake } from './snake';

export type OrderCamel = {
  [K in keyof OrderSnake as SnakeToCamelCase<K>]: OrderSnake[K];
};
export type OrderItemCamel = {
  [K in keyof OrderItemSnake as SnakeToCamelCase<K>]: OrderItemSnake[K];
};
