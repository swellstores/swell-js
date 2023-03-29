import { CouponCamel } from './camel';
import { CouponSnake } from './snake';

export interface Coupon extends CouponSnake, CouponCamel {}
