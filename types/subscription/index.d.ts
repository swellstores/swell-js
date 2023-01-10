import { SubscriptionSnake } from './snake';
import { SubscriptionCamel } from './camel';

export interface Subscription extends SubscriptionSnake, SubscriptionCamel {}
