import { InvoiceSnake } from './snake';
import { InvoiceCamel } from './camel';

export interface Invoice extends InvoiceSnake, InvoiceCamel {}
