import type { MakeCase } from '../utils';

import type { Category } from './snake';
import type { CategoryCamel } from './camel';

export type CategoryCase = MakeCase<Category, CategoryCamel>;

export type { Category, CategoryCamel };
