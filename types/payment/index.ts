import type { MakeCase } from '../utils';

import type {
  InputPaymentElementApple,
  InputPaymentElementBase,
  InputPaymentElementCard,
  InputPaymentElementGoogle,
  InputPaymentElementIdeal,
  InputPaymentElementPaypal,
  InputPaymentRedirect,
  Payment,
} from './snake';

import type {
  InputPaymentElementAppleCamel,
  InputPaymentElementBaseCamel,
  InputPaymentElementCardCamel,
  InputPaymentElementGoogleCamel,
  InputPaymentElementIdealCamel,
  InputPaymentElementPaypalCamel,
  InputPaymentRedirectCamel,
  PaymentCamel,
} from './camel';

export type InputPaymentElementAppleCase = MakeCase<
  InputPaymentElementApple,
  InputPaymentElementAppleCamel
>;

export type InputPaymentElementBaseCase = MakeCase<
  InputPaymentElementBase,
  InputPaymentElementBaseCamel
>;

export type InputPaymentElementCardCase = MakeCase<
  InputPaymentElementCard,
  InputPaymentElementCardCamel
>;

export type InputPaymentElementGoogleCase = MakeCase<
  InputPaymentElementGoogle,
  InputPaymentElementGoogleCamel
>;

export type InputPaymentElementIdealCase = MakeCase<
  InputPaymentElementIdeal,
  InputPaymentElementIdealCamel
>;

export type InputPaymentElementPaypalCase = MakeCase<
  InputPaymentElementPaypal,
  InputPaymentElementPaypalCamel
>;

export type InputPaymentRedirectCase = MakeCase<
  InputPaymentRedirect,
  InputPaymentRedirectCamel
>;

export type PaymentCase = MakeCase<Payment, PaymentCamel>;

export type {
  InputPaymentElementApple,
  InputPaymentElementBase,
  InputPaymentElementCard,
  InputPaymentElementGoogle,
  InputPaymentElementIdeal,
  InputPaymentElementPaypal,
  InputPaymentRedirect,
  Payment,
  InputPaymentElementAppleCamel,
  InputPaymentElementBaseCamel,
  InputPaymentElementCardCamel,
  InputPaymentElementGoogleCamel,
  InputPaymentElementIdealCamel,
  InputPaymentElementPaypalCamel,
  InputPaymentRedirectCamel,
  PaymentCamel,
};
