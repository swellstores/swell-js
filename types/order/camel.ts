import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';

import type { CartCamel, CartItemPurchaseOptionCamel } from '../cart/camel';
import type { ProductCamel, VariantCamel } from '../product/camel';
import type { AccountCamel, AddressCamel } from '../account/camel';
import type { GiftcardCamel } from '../giftcard/camel';
import type { PaymentCamel } from '../payment/camel';
import type { BillingCamel } from '../billing/camel';
import type { CouponCamel } from '../coupon/camel';
import type { DiscountCamel } from '../discount/camel';
import type { PromotionCamel } from '../promotion/camel';
import type { SubscriptionCamel } from '../subscription/camel';
import type { PurchaseLinkCamel } from '../purchase_link/camel';
import type { ShipmentRatingCamel } from '../shipment_rating/camel';

import type {
  Order,
  OrderItem,
  OrderShipping,
  OrderOption,
  OrderGiftCard,
} from './snake';

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
