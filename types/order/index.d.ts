import { OrderSnake, OrderItemSnake } from './snake';
import { OrderCamel, OrderItemCamel } from './camel';

export interface Order extends OrderSnake, OrderCamel {}
export interface OrderItem extends OrderItemSnake, OrderItemCamel {}
