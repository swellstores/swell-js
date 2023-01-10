import { SnakeToCamelCase } from '..';
import { CardSnake, InputCreateTokenSnake, TokenResponseSnake } from './snake';

export type CardCamel = {
  [K in keyof CardSnake as SnakeToCamelCase<K>]: CardSnake[K];
};
export type InputCreateTokenCamel = {
  [K in keyof InputCreateTokenSnake as SnakeToCamelCase<K>]: InputCreateTokenSnake[K];
};
export type TokenResponseCamel = {
  [K in keyof TokenResponseSnake as SnakeToCamelCase<K>]: TokenResponseSnake[K];
};
