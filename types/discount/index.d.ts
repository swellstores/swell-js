import { DiscountCamel } from './camel';
import { DiscountSnake } from './snake';

export interface Discount extends DiscountSnake, DiscountCamel {}
