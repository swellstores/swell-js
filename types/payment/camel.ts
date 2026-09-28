import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
} from '../index.js';
import type { Replace } from '../utils.js';

import type { AccountCamel } from '../account/camel.js';
import type { SubscriptionCamel } from '../subscription/camel.js';
import type { GiftcardCamel } from '../giftcard/camel.js';
import type { InvoiceCamel } from '../invoice/camel.js';
import type { RefundCamel } from '../refund/camel.js';
import type { OrderCamel } from '../order/camel.js';
import type { CardCamel } from '../card/camel.js';

import type { Payment } from './snake.js';

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
