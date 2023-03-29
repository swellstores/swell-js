import { SnakeToCamelCase } from '..';
import {
  BillingSnake,
  BillingAffirmSnake,
  BillingResolveSnake,
  BillingKlarnaSnake,
  BillingIdealSnake,
  BillingBancontactSnake,
  BillingGoogleSnake,
  BillingAppleSnake,
} from '../billing/snake';

export type BillingCamel = {
  [K in keyof BillingSnake as SnakeToCamelCase<K>]: BillingSnake[K];
};
export type BillingAffirmCamel = {
  [K in keyof BillingAffirmSnake as SnakeToCamelCase<K>]: BillingAffirmSnake[K];
};
export type BillingResolveCamel = {
  [K in keyof BillingResolveSnake as SnakeToCamelCase<K>]: BillingResolveSnake[K];
};
export type BillingKlarnaCamel = {
  [K in keyof BillingKlarnaSnake as SnakeToCamelCase<K>]: BillingKlarnaSnake[K];
};
export type BillingIdealCamel = {
  [K in keyof BillingIdealSnake as SnakeToCamelCase<K>]: BillingIdealSnake[K];
};
export type BillingBancontactCamel = {
  [K in keyof BillingBancontactSnake as SnakeToCamelCase<K>]: BillingBancontactSnake[K];
};
export type BillingGoogleCamel = {
  [K in keyof BillingGoogleSnake as SnakeToCamelCase<K>]: BillingGoogleSnake[K];
};
export type BillingAppleCamel = {
  [K in keyof BillingAppleSnake as SnakeToCamelCase<K>]: BillingAppleSnake[K];
};
