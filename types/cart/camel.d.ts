import { SnakeToCamelCase } from '..';
import { CartSnake, CartItemSnake, CartItemOptionsSnake, CartGiftCardItemSnake, CartShipmentRatingSnake, CartShippingSnake } from './snake';

export type CartCamel = {
  [K in keyof CartSnake as SnakeToCamelCase<K>]: CartSnake[K];
};
export type CartItemCamel = {
  [K in keyof CartItemSnake as SnakeToCamelCase<K>]: CartItemSnake[K];
};
export type CartItemOptionsCamel = {
  [K in keyof CartItemOptionsSnake as SnakeToCamelCase<K>]: CartItemOptionsSnake[K];
};
export type CartGiftCardItemCamel = {
  [K in keyof CartGiftCardItemSnake as SnakeToCamelCase<K>]: CartGiftCardItemSnake[K];
}
export type CartShipmentRatingCamel = {
  [K in keyof CartShipmentRatingSnake as SnakeToCamelCase<K>]: CartShipmentRatingSnake[K];
}
export type CartShippingCamel = {
  [K in keyof CartShippingSnake as SnakeToCamelCase<K>]: CartShippingSnake[K];
}