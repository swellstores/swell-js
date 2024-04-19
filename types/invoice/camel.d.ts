import { ConvertSnakeToCamelCase } from '..';
import { InvoiceSnake } from './snake';

export type InvoiceCamel = ConvertSnakeToCamelCase<InvoiceSnake>;
