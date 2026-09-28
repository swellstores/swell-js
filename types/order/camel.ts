import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
} from '../index.js';
import type { Replace } from '../utils.js';

import type { CartCamel, CartItemPurchaseOptionCamel } from '../cart/camel.js';
import type { ProductCamel, VariantCamel } from '../product/camel.js';
import type { AccountCamel, AddressCamel } from '../account/camel.js';
import type { GiftcardCamel } from '../giftcard/camel.js';
import type { PaymentCamel } from '../payment/camel.js';
import type { BillingCamel } from '../billing/camel.js';
import type { CouponCamel } from '../coupon/camel.js';
import type { DiscountCamel } from '../discount/camel.js';
import type { PromotionCamel } from '../promotion/camel.js';
import type { SubscriptionCamel } from '../subscription/camel.js';
import type { PurchaseLinkCamel } from '../purchase_link/camel.js';
import type { ShipmentRatingCamel } from '../shipment_rating/camel.js';

import type {
  Order,
  OrderItem,
  OrderShipping,
  OrderOption,
  OrderGiftCard,
} from './snake.js';

export type OrderOptionCamel = ConvertSnakeToCamelCase<OrderOption>;

export type OrderItemCamel = ConvertSnakeToCamelCase<
  Replace<
    OrderItem,
    {
      options?: OrderOptionCamel[];
      product?: ProductCamel;
      purchase_option?: CartItemPurchaseOptionCamel;
      variant?: VariantCamel;
    }
  >
>;

export type OrderShippingCamel = ConvertSnakeToCamelCase<
  Replace<
    OrderShipping,
    {
      account_address?: AddressCamel;
    }
  >
>;

export type OrderGiftCardCamel = ConvertSnakeToCamelCase<
  Replace<
    OrderGiftCard,
    {
      giftcard?: GiftcardCamel;
    }
  >
>;

export type OrderCamel = ConvertSnakeToCamelCase<
  Replace<
    Order,
    {
      account?: AccountCamel;
      authorized_payment?: PaymentCamel;
      billing?: BillingCamel;
      cart?: CartCamel;
      coupon?: CouponCamel;
      discounts?: DiscountCamel[];
      giftcards?: OrderGiftCardCamel[];
      items?: OrderItemCamel[];
      next?: OrderCamel;
      payments?: ResultsResponseCamel<PaymentCamel>;
      prev?: OrderCamel;
      promotions?: ResultsResponseCamel<PromotionCamel>;
      purchase_links?: ResultsResponseCamel<PurchaseLinkCamel>;
      shipment_rating?: ShipmentRatingCamel;
      shipping?: OrderShippingCamel;
      subscription?: SubscriptionCamel;
    }
  >
>;
