import type { ConvertSnakeToCamelCase } from '..';
import type { Replace } from '../utils';

import type {
  Billing,
  BillingAffirm,
  BillingResolve,
  BillingKlarna,
  BillingIdeal,
  BillingBancontact,
  BillingGoogle,
  BillingApple,
} from './snake';

import type { CardCamel } from '../card/camel';

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
