import type { MakeCase } from '../utils.js';

import type {
  SubscriptionBillingSchedule,
  SubscriptionOrderSchedule,
  SubscriptionItem,
  Subscription,
} from './snake.js';

import type {
  SubscriptionBillingScheduleCamel,
  SubscriptionOrderScheduleCamel,
  SubscriptionItemCamel,
  SubscriptionCamel,
} from './camel.js';

export type SubscriptionCase = MakeCase<Subscription, SubscriptionCamel>;

export type {
  SubscriptionBillingSchedule,
  SubscriptionOrderSchedule,
  SubscriptionItem,
  Subscription,
  SubscriptionBillingScheduleCamel,
  SubscriptionOrderScheduleCamel,
  SubscriptionItemCamel,
  SubscriptionCamel,
};
