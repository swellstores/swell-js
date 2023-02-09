import { InvoiceSnake } from './snake';
import { InvoicenCamel } from './camel';

export interface Invoice extends InvoiceSnake, InvoicenCamel {}
