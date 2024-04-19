import { ConvertSnakeToCamelCase } from '..';

import {
  OrderSnake,
  OrderItemSnake,
  OrderShippingSnake,
  OrderOptionSnake,
  OrderGiftCardSnake,
} from './snake';

export type OrderOptionCamel = ConvertSnakeToCamelCase<OrderOptionSnake>;
export type OrderGiftCardCamel = ConvertSnakeToCamelCase<OrderGiftCardSnake>;
export type OrderCamel = ConvertSnakeToCamelCase<OrderSnake>;
export type OrderItemCamel = ConvertSnakeToCamelCase<OrderItemSnake>;
export type OrderShippingCamel = ConvertSnakeToCamelCase<OrderShippingSnake>;
