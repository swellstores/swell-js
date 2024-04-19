import { ConvertSnakeToCamelCase } from '..';

import {
  SubscriptionBillingScheduleSnake,
  SubscriptionOrderScheduleSnake,
  SubscriptionSnake,
} from './snake';

export type SubscriptionOrderScheduleCamel =
  ConvertSnakeToCamelCase<SubscriptionOrderScheduleSnake>;

export type SubscriptionBillingScheduleCamel =
  ConvertSnakeToCamelCase<SubscriptionBillingScheduleSnake>;

export type SubscriptionCamel = ConvertSnakeToCamelCase<SubscriptionSnake>;
