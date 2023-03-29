import { SubscriptionBillingScheduleSnake, SubscriptionSnake } from './snake';
import { SubscriptionCamel, SubscriptionBillingScheduleCamel } from './camel';

export interface Subscription extends SubscriptionSnake, SubscriptionCamel {}
export interface SubscriptionBillingSchedule
  extends SubscriptionBillingScheduleSnake,
    SubscriptionBillingScheduleCamel {}
