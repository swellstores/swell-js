import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';

import type { AccountCamel } from '../account/camel';
import type {
  CartItemOptionsCamel,
  CartItemPurchaseOptionCamel,
} from '../cart/camel';
import type { ProductCamel, VariantCamel } from '../product/camel';
import type { DiscountCamel } from '../discount/camel';
import type { PaymentCamel } from '../payment/camel';
import type { InvoiceCamel } from '../invoice/camel';
import type { BillingCamel } from '../billing/camel';
import type { CouponCamel } from '../coupon/camel';
import type { RefundCamel } from '../refund/camel';
import type { OrderCamel } from '../order/camel';

import type {
  SubscriptionBillingSchedule,
  SubscriptionOrderSchedule,
  SubscriptionItem,
  Subscription,
} from './snake';

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
