import { SnakeToCamelCase } from '..';
import { PaymentSnake } from './snake';

export type PaymentCamel = {
  [K in keyof PaymentSnake as SnakeToCamelCase<K>]: PaymentSnake[K];
};
