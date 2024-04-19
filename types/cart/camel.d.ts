import { ConvertSnakeToCamelCase } from '..';

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

export type CartCamel = ConvertSnakeToCamelCase<CartSnake>;
export type CartItemCamel = ConvertSnakeToCamelCase<CartItemSnake>;

export type CartItemOptionsCamel =
  ConvertSnakeToCamelCase<CartItemOptionsSnake>;

export type CartItemPurchaseOptionCamel =
  ConvertSnakeToCamelCase<CartItemPurchaseOptionSnake>;

export type CartItemBillingScheduleCamel =
  ConvertSnakeToCamelCase<CartItemBillingScheduleSnake>;

export type CartItemOrderScheduleCamel =
  ConvertSnakeToCamelCase<CartItemOrderScheduleSnake>;

export type CartGiftCardItemCamel =
  ConvertSnakeToCamelCase<CartGiftCardItemSnake>;

export type CartShippingCamel = ConvertSnakeToCamelCase<CartShippingSnake>;
