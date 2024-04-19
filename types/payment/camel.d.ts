import { ConvertSnakeToCamelCase } from '..';

import {
  PaymentSnake,
  InputPaymentElementAppleSnake,
  InputPaymentElementBaseSnake,
  InputPaymentElementCardSnake,
  InputPaymentElementGoogleSnake,
  InputPaymentElementIdealSnake,
  InputPaymentElementPaypalSnake,
  InputPaymentRedirectSnake,
} from './snake';

export type PaymentCamel = ConvertSnakeToCamelCase<PaymentSnake>;

export type InputPaymentElementBaseCamel =
  ConvertSnakeToCamelCase<InputPaymentElementBaseSnake>;

export type InputPaymentElementCardCamel =
  ConvertSnakeToCamelCase<InputPaymentElementCardSnake>;

export type InputPaymentElementIdealCamel =
  ConvertSnakeToCamelCase<InputPaymentElementIdealSnake>;

export type InputPaymentElementPaypalCamel =
  ConvertSnakeToCamelCase<InputPaymentElementPaypalSnake>;

export type InputPaymentElementAppleCamel =
  ConvertSnakeToCamelCase<InputPaymentElementAppleSnake>;

export type InputPaymentElementGoogleCamel =
  ConvertSnakeToCamelCase<InputPaymentElementGoogleSnake>;

export type InputPaymentRedirectCamel =
  ConvertSnakeToCamelCase<InputPaymentRedirectSnake>;
