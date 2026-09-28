import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type { OrderCamel, OrderShippingCamel } from '../order/camel.js';
import type { SubscriptionCamel } from '../subscription/camel.js';
import type { DiscountCamel } from '../discount/camel.js';
import type { AccountCamel } from '../account/camel.js';
import type { ProductCamel } from '../product/camel.js';
import type { BillingCamel } from '../billing/camel.js';
import type { CouponCamel } from '../coupon/camel.js';

import type { Invoice, InvoiceItem } from './snake.js';

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
