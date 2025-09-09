import type { ConvertSnakeToCamelCase } from '..';
import type { Replace } from '../utils';

import type { OrderCamel, OrderShippingCamel } from '../order/camel';
import type { SubscriptionCamel } from '../subscription/camel';
import type { DiscountCamel } from '../discount/camel';
import type { AccountCamel } from '../account/camel';
import type { ProductCamel } from '../product/camel';
import type { BillingCamel } from '../billing/camel';
import type { CouponCamel } from '../coupon/camel';

import type { Invoice, InvoiceItem } from './snake';

export type InvoiceItemCamel = ConvertSnakeToCamelCase<
  Replace<
    InvoiceItem,
    {
      product?: ProductCamel;
    }
  >
>;

export type InvoiceCamel = ConvertSnakeToCamelCase<
  Replace<
    Invoice,
    {
      account?: AccountCamel;
      billing?: BillingCamel;
      coupon?: CouponCamel;
      discounts?: DiscountCamel[];
      shipping?: OrderShippingCamel;
      subscription?: SubscriptionCamel;
      items?: InvoiceItemCamel[];
      order?: OrderCamel;
    }
  >
>;
