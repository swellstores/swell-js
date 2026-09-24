import type { MakeCase } from '../utils.js';

import type {
  Order,
  OrderOption,
  OrderItem,
  OrderShipping,
  OrderGiftCard,
} from './snake.js';

import type {
  OrderCamel,
  OrderGiftCardCamel,
  OrderItemCamel,
  OrderOptionCamel,
  OrderShippingCamel,
} from './camel.js';

export type OrderCase = MakeCase<Order, OrderCamel>;

export type {
  Order,
  OrderOption,
  OrderItem,
  OrderShipping,
  OrderGiftCard,
  OrderCamel,
  OrderGiftCardCamel,
  OrderItemCamel,
  OrderOptionCamel,
  OrderShippingCamel,
};
