import type { MakeCase } from '../utils';

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

import type {
  CartCamel,
  CartItemCamel,
  CartItemOptionsCamel,
  CartItemPurchaseOptionCamel,
  CartItemBillingScheduleCamel,
  CartItemOrderScheduleCamel,
  CartGiftCardItemCamel,
  CartShippingCamel,
} from './camel';

export type CartCase = MakeCase<Cart, CartCamel>;
export type CartItemCase = MakeCase<CartItem, CartItemCamel>;

export type {
  Cart,
  CartItem,
  CartItemOptions,
  CartItemPurchaseOption,
  CartItemBillingSchedule,
  CartItemOrderSchedule,
  CartGiftCardItem,
  CartShipping,
  CartCamel,
  CartItemCamel,
  CartItemOptionsCamel,
  CartItemPurchaseOptionCamel,
  CartItemBillingScheduleCamel,
  CartItemOrderScheduleCamel,
  CartGiftCardItemCamel,
  CartShippingCamel,
};
