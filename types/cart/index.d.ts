import { CartSnake, CartItemSnake } from './snake';
import { CartCamel, CartItemCamel } from './camel';

export interface Cart extends CartSnake, CartCamel {}
export interface CartItem extends CartItemSnake, CartItemCamel {}
