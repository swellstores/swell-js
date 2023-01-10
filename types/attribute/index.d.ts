import { AttributeCamel } from './camel';
import { AttributeSnake } from './snake';

export interface Attribute extends AttributeCamel, AttributeSnake {}
