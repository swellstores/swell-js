import type { MakeCase } from '../utils';

import type {
  SubscriptionBillingSchedule,
  SubscriptionOrderSchedule,
  SubscriptionItem,
  Subscription,
} from './snake';

import type {
  SubscriptionBillingScheduleCamel,
  SubscriptionOrderScheduleCamel,
  SubscriptionItemCamel,
  SubscriptionCamel,
} from './camel';

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
