import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';

import type { AccountCamel } from '../account/camel';
import type { SubscriptionCamel } from '../subscription/camel';
import type { GiftcardCamel } from '../giftcard/camel';
import type { InvoiceCamel } from '../invoice/camel';
import type { RefundCamel } from '../refund/camel';
import type { OrderCamel } from '../order/camel';
import type { CardCamel } from '../card/camel';

import type {
  Payment,
  InputPaymentElementApple,
  InputPaymentElementBase,
  InputPaymentElementCard,
  InputPaymentElementGoogle,
  InputPaymentElementIdeal,
  InputPaymentElementPaypal,
  InputPaymentRedirect,
} from './snake';

export type PaymentCamel = ConvertSnakeToCamelCase<
  Replace<
    Payment,
    {
      account?: AccountCamel;
      account_card?: CardCamel;
      card?: CardCamel;
      giftcard?: GiftcardCamel;
      invoice?: InvoiceCamel;
      order?: OrderCamel;
      refunds?: ResultsResponseCamel<RefundCamel>;
      subscription?: SubscriptionCamel;
    }
  >
>;

export type InputPaymentElementBaseCamel =
  ConvertSnakeToCamelCase<InputPaymentElementBase>;

export type InputPaymentElementCardCamel =
  ConvertSnakeToCamelCase<InputPaymentElementCard>;

export type InputPaymentElementIdealCamel =
  ConvertSnakeToCamelCase<InputPaymentElementIdeal>;

export type InputPaymentElementPaypalCamel =
  ConvertSnakeToCamelCase<InputPaymentElementPaypal>;

export type InputPaymentElementAppleCamel =
  ConvertSnakeToCamelCase<InputPaymentElementApple>;

export type InputPaymentElementGoogleCamel =
  ConvertSnakeToCamelCase<InputPaymentElementGoogle>;

export type InputPaymentRedirectCamel =
  ConvertSnakeToCamelCase<InputPaymentRedirect>;
