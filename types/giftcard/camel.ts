import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
} from '../index.js';
import type { Replace } from '../utils.js';

import type { AccountCamel } from '../account/camel.js';
import type { OrderCamel } from '../order/camel.js';
import type { PaymentCamel } from '../payment/camel.js';
import type { RefundCamel } from '../refund/camel.js';

import type { GiftcardDebit, Giftcard } from './snake.js';

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
