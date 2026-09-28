import type { MakeCase } from '../utils.js';

import type { Attribute } from './snake.js';
import type { AttributeCamel } from './camel.js';

export type AttributeCase = MakeCase<Attribute, AttributeCamel>;

export type { Attribute, AttributeCamel };
