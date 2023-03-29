import { SnakeToCamelCase } from '..';
import { PurchaseLinkDiscountSnake, PurchaseLinkSnake } from './snake';

export type PurchaseLinkDiscountCamel = {
  [K in keyof PurchaseLinkDiscountSnake as SnakeToCamelCase<K>]: PurchaseLinkDiscountSnake[K];
};

export type PurchaseLinkCamel = {
  [K in keyof PurchaseLinkSnake as SnakeToCamelCase<K>]: PurchaseLinkSnake[K];
};
