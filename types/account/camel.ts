import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';
import type { PasswordTokenInput, Account, Address } from './snake';
import type { BillingCamel } from '../billing/camel';
import type { CardCamel } from '../card/camel';
import type { OrderCamel } from '../order/camel';
import type { SubscriptionCamel } from '../subscription/camel';

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
