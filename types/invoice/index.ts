import type { MakeCase } from '../utils';

import type { Invoice, InvoiceItem } from './snake';
import type { InvoiceCamel, InvoiceItemCamel } from './camel';

export type InvoiceCase = MakeCase<Invoice, InvoiceCamel>;

export type { Invoice, InvoiceItem, InvoiceCamel, InvoiceItemCamel };
