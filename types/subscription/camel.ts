import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
} from '../index.js';
import type { Replace } from '../utils.js';

import type { AccountCamel } from '../account/camel.js';
import type {
  CartItemOptionsCamel,
  CartItemPurchaseOptionCamel,
} from '../cart/camel.js';
import type { ProductCamel, VariantCamel } from '../product/camel.js';
import type { DiscountCamel } from '../discount/camel.js';
import type { PaymentCamel } from '../payment/camel.js';
import type { InvoiceCamel } from '../invoice/camel.js';
import type { BillingCamel } from '../billing/camel.js';
import type { CouponCamel } from '../coupon/camel.js';
import type { RefundCamel } from '../refund/camel.js';
import type { OrderCamel } from '../order/camel.js';

import type {
  SubscriptionBillingSchedule,
  SubscriptionOrderSchedule,
  SubscriptionItem,
  Subscription,
} from './snake.js';

export type SubscriptionItemCamel = ConvertSnakeToCamelCase<
  Replace<
    SubscriptionItem,
    {
      purchase_option?: CartItemPurchaseOptionCamel;
    }
  >
>;

export type SubscriptionOrderScheduleCamel =
  ConvertSnakeToCamelCase<SubscriptionOrderSchedule>;

export type SubscriptionBillingScheduleCamel =
  ConvertSnakeToCamelCase<SubscriptionBillingSchedule>;

export type SubscriptionCamel = ConvertSnakeToCamelCase<
  Replace<
    Subscription,
    {
      account?: AccountCamel;
      billing?: BillingCamel;
      billing_schedule?: SubscriptionBillingScheduleCamel;
      coupon?: CouponCamel;
      discounts?: DiscountCamel[];
      invoices?: ResultsResponseCamel<InvoiceCamel>;
      items?: SubscriptionItemCamel[];
      options?: CartItemOptionsCamel[];
      order_schedule?: SubscriptionOrderScheduleCamel;
      orders?: ResultsResponseCamel<OrderCamel>;
      payments?: ResultsResponseCamel<PaymentCamel>;
      pending_invoices?: ResultsResponseCamel<InvoiceCamel>;
      product?: ProductCamel;
      refunds?: ResultsResponseCamel<RefundCamel>;
      variant?: VariantCamel;
    }
  >
>;
