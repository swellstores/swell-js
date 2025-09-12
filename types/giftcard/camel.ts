import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';

import type { AccountCamel } from '../account/camel';
import type { OrderCamel } from '../order/camel';
import type { PaymentCamel } from '../payment/camel';
import type { RefundCamel } from '../refund/camel';

import type { GiftcardDebit, Giftcard } from './snake';

export type GiftcardDebitCamel = ConvertSnakeToCamelCase<
  Replace<
    GiftcardDebit,
    {
      payment?: PaymentCamel;
      refund?: RefundCamel;
    }
  >
>;

export type GiftcardCamel = ConvertSnakeToCamelCase<
  Replace<
    Giftcard,
    {
      account?: AccountCamel;
      order?: OrderCamel;
      debits?: ResultsResponseCamel<GiftcardDebitCamel>;
    }
  >
>;
