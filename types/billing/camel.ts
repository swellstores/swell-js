import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type {
  Billing,
  BillingAffirm,
  BillingResolve,
  BillingKlarna,
  BillingIdeal,
  BillingBancontact,
  BillingGoogle,
  BillingApple,
} from './snake.js';

import type { CardCamel } from '../card/camel.js';

export type BillingAffirmCamel = ConvertSnakeToCamelCase<BillingAffirm>;
export type BillingResolveCamel = ConvertSnakeToCamelCase<BillingResolve>;
export type BillingKlarnaCamel = ConvertSnakeToCamelCase<BillingKlarna>;
export type BillingIdealCamel = ConvertSnakeToCamelCase<BillingIdeal>;
export type BillingBancontactCamel = ConvertSnakeToCamelCase<BillingBancontact>;
export type BillingGoogleCamel = ConvertSnakeToCamelCase<BillingGoogle>;
export type BillingAppleCamel = ConvertSnakeToCamelCase<BillingApple>;

export type BillingCamel = ConvertSnakeToCamelCase<
  Replace<
    Billing,
    {
      card?: Omit<CardCamel, 'billing'>;
      account_card?: CardCamel;
      affirm?: BillingAffirmCamel;
      klarna?: BillingKlarnaCamel;
      ideal?: BillingIdealCamel;
      bancontact?: BillingBancontactCamel;
      google?: BillingGoogleCamel;
      apple?: BillingAppleCamel;
    }
  >
>;
