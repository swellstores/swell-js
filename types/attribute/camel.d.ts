import { SnakeToCamelCase } from '..';
import { AttributeSnake } from './snake';

export type AttributeCamel = {
  [K in keyof AttributeSnake as SnakeToCamelCase<K>]: AttributeSnake[K];
};
