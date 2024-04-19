import {
  SubscriptionBillingScheduleSnake,
  SubscriptionOrderScheduleSnake,
  SubscriptionSnake,
} from './snake';

import {
  SubscriptionCamel,
  SubscriptionBillingScheduleCamel,
  SubscriptionOrderScheduleCamel,
} from './camel';

export interface SubscriptionOrderSchedule
  extends SubscriptionOrderScheduleSnake,
    SubscriptionOrderScheduleCamel {}

export interface SubscriptionBillingSchedule
  extends SubscriptionBillingScheduleSnake,
    SubscriptionBillingScheduleCamel {}

export interface Subscription extends SubscriptionSnake, SubscriptionCamel {}
