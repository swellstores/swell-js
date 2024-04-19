import {
  OrderSnake,
  OrderItemSnake,
  OrderShippingSnake,
  OrderGiftCardSnake,
} from './snake';

import {
  OrderCamel,
  OrderGiftCardCamel,
  OrderItemCamel,
  OrderOptionCamel,
  OrderShippingCamel,
} from './camel';

export interface Order extends OrderSnake, OrderCamel {}
export interface OrderOption extends OrderOptionCamel, OrderOptionCamel {}
export interface OrderItem extends OrderItemSnake, OrderItemCamel {}
export interface OrderShipping extends OrderShippingSnake, OrderShippingCamel {}
export interface OrderGiftCard extends OrderGiftCardCamel, OrderGiftCardSnake {}
