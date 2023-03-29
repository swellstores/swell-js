import { BaseModel } from '../index';
import { Order } from '../order';
import { Subscription } from '../subscription';
import { CouponCamel } from './camel';

interface CouponSnake extends BaseModel {
  parent_id?: string;
  parent?: CouponSnake;
  account_id?: string;
  order_id?: string;
  order?: Order;
  subscription_id?: string;
  subscription?: Subscription;
}
