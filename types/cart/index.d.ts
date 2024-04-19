import {
  CartSnake,
  CartItemSnake,
  CartItemOptionsSnake,
  CartItemPurchaseOptionSnake,
  CartItemBillingScheduleSnake,
  CartItemOrderScheduleSnake,
  CartGiftCardItemSnake,
  CartShippingSnake,
} from './snake';

import {
  CartCamel,
  CartItemCamel,
  CartItemOptionsCamel,
  CartItemPurchaseOptionCamel,
  CartItemBillingScheduleCamel,
  CartItemOrderScheduleCamel,
  CartGiftCardItemCamel,
  CartShippingCamel,
} from './camel';

export interface Cart extends CartSnake, CartCamel {}
export interface CartItem extends CartItemSnake, CartItemCamel {}

export interface CartItemOptions
  extends CartItemOptionsSnake,
    CartItemOptionsCamel {}

export interface CartItemPurchaseOption
  extends CartItemPurchaseOptionSnake,
    CartItemPurchaseOptionCamel {}

export interface CartItemBillingSchedule
  extends CartItemBillingScheduleSnake,
    CartItemBillingScheduleCamel {}

export interface CartItemOrderSchedule
  extends CartItemOrderScheduleSnake,
    CartItemOrderScheduleCamel {}

export interface CartGiftCardItem
  extends CartGiftCardItemSnake,
    CartGiftCardItemCamel {}

export interface CartShipping extends CartShippingCamel, CartShippingSnake {}
