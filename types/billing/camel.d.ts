import { ConvertSnakeToCamelCase } from '..';

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

export type BillingCamel = ConvertSnakeToCamelCase<BillingSnake>;
export type BillingAffirmCamel = ConvertSnakeToCamelCase<BillingAffirmSnake>;
export type BillingResolveCamel = ConvertSnakeToCamelCase<BillingResolveSnake>;
export type BillingKlarnaCamel = ConvertSnakeToCamelCase<BillingKlarnaSnake>;
export type BillingIdealCamel = ConvertSnakeToCamelCase<BillingIdealSnake>;

export type BillingBancontactCamel =
  ConvertSnakeToCamelCase<BillingBancontactSnake>;

export type BillingGoogleCamel = ConvertSnakeToCamelCase<BillingGoogleSnake>;

export type BillingAppleCamel = ConvertSnakeToCamelCase<BillingAppleSnake>;
