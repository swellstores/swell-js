import type { MakeCase } from '../utils.js';

import type { Invoice, InvoiceItem } from './snake.js';
import type { InvoiceCamel, InvoiceItemCamel } from './camel.js';

export type InvoiceCase = MakeCase<Invoice, InvoiceCamel>;

export type { Invoice, InvoiceItem, InvoiceCamel, InvoiceItemCamel };
