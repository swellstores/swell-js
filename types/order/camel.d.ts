import { SnakeToCamelCase } from '..';
import {
  OrderSnake,
  OrderItemSnake,
  OrderShippingSnake,
  OrderOptionSnake,
  OrderGiftCardSnake,
} from './snake';

export type OrderOptionCamel = {
  [K in keyof OrderOptionSnake as SnakeToCamelCase<K>]: OrderOptionSnake[K];
};
export type OrderGiftCardCamel = {
  [K in keyof OrderGiftCardSnake as SnakeToCamelCase<K>]: OrderGiftCardSnake[K];
};
export type OrderCamel = {
  [K in keyof OrderSnake as SnakeToCamelCase<K>]: OrderSnake[K];
};
export type OrderItemCamel = {
  [K in keyof OrderItemSnake as SnakeToCamelCase<K>]: OrderItemSnake[K];
};
export type OrderShippingCamel = {
  [K in keyof OrderShippingSnake as SnakeToCamelCase<K>]: OrderShippingSnake[K];
};
