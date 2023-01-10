import { SnakeToCamelCase } from '..';
import { SubscriptionSnake } from './snake';

export type SubscriptionCamel = {
  [K in keyof SubscriptionSnake as SnakeToCamelCase<K>]: SubscriptionSnake[K];
};
