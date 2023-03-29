import { PurchaseLinkDiscountSnake, PurchaseLinkSnake } from './snake';

import { PurchaseLinkCamel, PurchaseLinkDiscountCamel } from './camel';

export interface PurhcaseLink extends PurchaseLinkCamel, PurchaseLinkSnake {}
export interface PurhcaseLinkDiscount
  extends PurchaseLinkDiscountCamel,
    PurchaseLinkDiscountSnake {}
