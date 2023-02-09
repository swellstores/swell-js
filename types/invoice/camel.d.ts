import { SnakeToCamelCase } from '..';
import { InvoiceSnake } from './snake';

export type InvoiceCamel = {
  [K in keyof InvoiceSnake as SnakeToCamelCase<K>]: InvoiceSnake[K];
};
