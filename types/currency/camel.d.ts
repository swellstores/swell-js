import { SnakeToCamelCase } from '..';
import {
  FormatInputSnake,
  SelectCurrencyReturnSnake,
  EnabledCurrencySnake,
} from './snake';

export type FormatInputCamel = {
  [K in keyof FormatInputSnake as SnakeToCamelCase<K>]: FormatInputSnake[K];
};
export type SelectCurrencyReturnCamel = {
  [K in keyof SelectCurrencyReturnSnake as SnakeToCamelCase<K>]: SelectCurrencyReturnSnake[K];
};
export type EnabledCurrencyCamel = {
  [K in keyof EnabledCurrencySnake as SnakeToCamelCase<K>]: EnabledCurrencySnake[K];
};
