import type { MakeCase } from '../utils';

import type {
  Order,
  OrderOption,
  OrderItem,
  OrderShipping,
  OrderGiftCard,
} from './snake';

import type {
  OrderCamel,
  OrderGiftCardCamel,
  OrderItemCamel,
  OrderOptionCamel,
  OrderShippingCamel,
} from './camel';

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
