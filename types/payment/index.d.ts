import {
  InputPaymentElementAppleSnake,
  InputPaymentElementBaseSnake,
  InputPaymentElementCardSnake,
  InputPaymentElementGoogleSnake,
  InputPaymentElementIdealSnake,
  InputPaymentElementPaypalSnake,
  InputPaymentRedirectSnake,
  PaymentSnake,
} from './snake';

import {
  InputPaymentElementAppleCamel,
  InputPaymentElementBaseCamel,
  InputPaymentElementCardCamel,
  InputPaymentElementGoogleCamel,
  InputPaymentElementIdealCamel,
  InputPaymentElementPaypalCamel,
  InputPaymentRedirectCamel,
  PaymentCamel,
} from './camel';

export interface Payment extends PaymentCamel, PaymentSnake {}

export interface InputPaymentElementBase
  extends InputPaymentElementBaseSnake,
    InputPaymentElementBaseCamel {}

export interface InputPaymentElementCard
  extends InputPaymentElementCardSnake,
    InputPaymentElementCardCamel {}

export interface InputPaymentElementIdeal
  extends InputPaymentElementIdealSnake,
    InputPaymentElementIdealCamel {}

export interface InputPaymentElementPaypal
  extends InputPaymentElementPaypalSnake,
    InputPaymentElementPaypalCamel {}

export interface InputPaymentElementApple
  extends InputPaymentElementAppleSnake,
    InputPaymentElementAppleCamel {}

export interface InputPaymentElementGoogle
  extends InputPaymentElementGoogleSnake,
    InputPaymentElementGoogleCamel {}

export interface InputPaymentRedirect
  extends InputPaymentRedirectSnake,
    InputPaymentRedirectCamel {}
