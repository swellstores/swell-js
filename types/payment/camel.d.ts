import { SnakeToCamelCase } from '..';
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

export type PaymentCamel = {
  [K in keyof PaymentSnake as SnakeToCamelCase<K>]: PaymentSnake[K];
};

export type InputPaymentElementBaseCamel = {
  [K in keyof InputPaymentElementBaseSnake as SnakeToCamelCase<K>]: InputPaymentElementBaseSnake[K];
};

export type InputPaymentElementCardCamel = {
  [K in keyof InputPaymentElementCardSnake as SnakeToCamelCase<K>]: InputPaymentElementCardSnake[K];
};

export type InputPaymentElementIdealCamel = {
  [K in keyof InputPaymentElementIdealSnake as SnakeToCamelCase<K>]: InputPaymentElementIdealSnake[K];
};

export type InputPaymentElementPaypalCamel = {
  [K in keyof InputPaymentElementPaypalSnake as SnakeToCamelCase<K>]: InputPaymentElementPaypalSnake[K];
};

export type InputPaymentElementAppleCamel = {
  [K in keyof InputPaymentElementAppleSnake as SnakeToCamelCase<K>]: InputPaymentElementAppleSnake[K];
};

export type InputPaymentElementGoogleCamel = {
  [K in keyof InputPaymentElementGoogleSnake as SnakeToCamelCase<K>]: InputPaymentElementGoogleSnake[K];
};

export type InputPaymentRedirectCamel = {
  [K in keyof InputPaymentRedirectSnake as SnakeToCamelCase<K>]: InputPaymentRedirectSnake[K];
};
