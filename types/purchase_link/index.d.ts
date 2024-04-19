import { PurchaseLinkSnake } from './snake';
import { PurchaseLinkCamel } from './camel';

export interface PurchaseLink extends PurchaseLinkCamel, PurchaseLinkSnake {}
