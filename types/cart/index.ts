import type { MakeCase } from '../utils.js';

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

import type {
  CartCamel,
  CartItemCamel,
  CartItemOptionsCamel,
  CartItemPurchaseOptionCamel,
  CartItemBillingScheduleCamel,
  CartItemOrderScheduleCamel,
  CartGiftCardItemCamel,
  CartShippingCamel,
} from './camel.js';

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
