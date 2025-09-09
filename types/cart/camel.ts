import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '../index';
import type { Replace } from '../utils';

import type { AccountCamel, AddressCamel } from '../account/camel';
import type { BillingCamel } from '../billing/camel';
import type { CouponCamel } from '../coupon/camel';
import type { DiscountCamel } from '../discount/camel';
import type { GiftcardCamel } from '../giftcard/camel';
import type { OrderCamel } from '../order/camel';
import type { ProductCamel, VariantCamel } from '../product/camel';
import type { PromotionCamel } from '../promotion/camel';
import type { PurchaseLinkCamel } from '../purchase_link/camel';
import type { ShipmentRatingCamel } from '../shipment_rating/camel';
import type { SubscriptionCamel } from '../subscription/camel';

import type {
  Cart,
  CartItem,
  CartItemOptions,
  CartItemPurchaseOption,
  CartItemBillingSchedule,
  CartItemOrderSchedule,
  CartGiftCardItem,
  CartShipping,
} from './snake';

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
