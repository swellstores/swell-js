import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
} from '../index.js';
import type { Replace } from '../utils.js';
import type { PasswordTokenInput, Account, Address } from './snake.js';
import type { BillingCamel } from '../billing/camel.js';
import type { CardCamel } from '../card/camel.js';
import type { OrderCamel } from '../order/camel.js';
import type { SubscriptionCamel } from '../subscription/camel.js';

export type PasswordTokenInputCamel =
  ConvertSnakeToCamelCase<PasswordTokenInput>;

export type AddressCamel = ConvertSnakeToCamelCase<Address>;

export type AccountCamel = ConvertSnakeToCamelCase<
  Replace<
    Account,
    {
      addresses?: ResultsResponseCamel<AddressCamel>;
      billing?: BillingCamel;
      cards?: ResultsResponseCamel<CardCamel>;
      orders?: ResultsResponseCamel<OrderCamel>;
      shipping?: AddressCamel;
      subscriptions?: ResultsResponseCamel<SubscriptionCamel>;
    }
  >
>;
