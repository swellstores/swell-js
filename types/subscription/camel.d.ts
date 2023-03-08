import { SnakeToCamelCase } from '..';
import { SubscriptionBillingScheduleSnake, SubscriptionSnake } from './snake';

export type SubscriptionCamel = {
  [K in keyof SubscriptionSnake as SnakeToCamelCase<K>]: SubscriptionSnake[K];
};

export type SubscriptionBillingScheduleCamel = {
  [K in keyof SubscriptionBillingScheduleSnake as SnakeToCamelCase<K>]: SubscriptionBillingScheduleSnake[K];
}
