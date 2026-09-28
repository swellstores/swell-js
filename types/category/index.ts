import type { MakeCase } from '../utils.js';

import type { Category } from './snake.js';
import type { CategoryCamel } from './camel.js';

export type CategoryCase = MakeCase<Category, CategoryCamel>;

export type { Category, CategoryCamel };
