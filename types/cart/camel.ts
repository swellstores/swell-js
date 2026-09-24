import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
} from '../index.js';
import type { Replace } from '../utils.js';

import type { AccountCamel, AddressCamel } from '../account/camel.js';
import type { BillingCamel } from '../billing/camel.js';
import type { CouponCamel } from '../coupon/camel.js';
import type { DiscountCamel } from '../discount/camel.js';
import type { GiftcardCamel } from '../giftcard/camel.js';
import type { OrderCamel } from '../order/camel.js';
import type { ProductCamel, VariantCamel } from '../product/camel.js';
import type { PromotionCamel } from '../promotion/camel.js';
import type { PurchaseLinkCamel } from '../purchase_link/camel.js';
import type { ShipmentRatingCamel } from '../shipment_rating/camel.js';
import type { SubscriptionCamel } from '../subscription/camel.js';

import type {
  Cart,
  CartItem,
  CartItemOptions,
  CartItemPurchaseOption,
  CartItemBillingSchedule,
  CartItemOrderSchedule,
  CartGiftCardItem,
  CartShipping,
} from './snake.js';

export type CartItemOptionsCamel = ConvertSnakeToCamelCase<CartItemOptions>;

export type CartGiftCardItemCamel = ConvertSnakeToCamelCase<
  Replace<
    CartGiftCardItem,
    {
      giftcard?: GiftcardCamel;
    }
  >
>;

export type CartItemBillingScheduleCamel =
  ConvertSnakeToCamelCase<CartItemBillingSchedule>;

export type CartItemOrderScheduleCamel =
  ConvertSnakeToCamelCase<CartItemOrderSchedule>;

export type CartItemPurchaseOptionCamel = ConvertSnakeToCamelCase<
  Replace<
    CartItemPurchaseOption,
    {
      billing_schedule?: CartItemBillingScheduleCamel;
      order_schedule?: CartItemOrderScheduleCamel;
    }
  >
>;

export type CartItemCamel = ConvertSnakeToCamelCase<
  Replace<
    CartItem,
    {
      discounts?: DiscountCamel[];
      options?: CartItemOptionsCamel[];
      product?: ProductCamel;
      purchase_option?: CartItemPurchaseOptionCamel;
      variant?: VariantCamel;
    }
  >
>;

export type CartShippingCamel = ConvertSnakeToCamelCase<
  Replace<
    CartShipping,
    {
      account_address?: AddressCamel;
    }
  >
>;

export type CartCamel = ConvertSnakeToCamelCase<
  Replace<
    Cart,
    {
      account?: AccountCamel;
      billing?: BillingCamel;
      coupon?: CouponCamel;
      discounts?: DiscountCamel[];
      giftcards?: CartGiftCardItemCamel[];
      items?: CartItemCamel[];
      order?: OrderCamel;
      promotions?: ResultsResponseCamel<PromotionCamel>;
      purchase_links?: ResultsResponseCamel<PurchaseLinkCamel>;
      shipment_rating?: ShipmentRatingCamel;
      shipping?: CartShippingCamel;
      subscription?: SubscriptionCamel;
      target_order?: OrderCamel;
    }
  >
>;
