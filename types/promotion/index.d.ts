import { PromotionCamel, PromotionExclusionCamel } from './camel';
import { PromotionSnake, PromotionExclusionSnake } from './snake';

export interface PromotionExclusion
  extends PromotionExclusionCamel,
    PromotionExclusionSnake {}

export interface Promotion extends PromotionCamel, PromotionSnake {}
