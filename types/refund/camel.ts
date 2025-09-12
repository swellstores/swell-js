import type { ConvertSnakeToCamelCase } from '..';
import type { Replace } from '../utils';

import type { OrderCamel } from '../order/camel';
import type { PaymentCamel } from '../payment/camel';
import type { SubscriptionCamel } from '../subscription/camel';

import type { Refund } from './snake';

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
