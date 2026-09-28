import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type { OrderCamel } from '../order/camel.js';
import type { PaymentCamel } from '../payment/camel.js';
import type { SubscriptionCamel } from '../subscription/camel.js';

import type { Refund } from './snake.js';

export type RefundCamel = ConvertSnakeToCamelCase<
  Replace<
    Refund,
    {
      order?: OrderCamel;
      parent: PaymentCamel;
      subscription: SubscriptionCamel;
    }
  >
>;
