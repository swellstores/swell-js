import type { MakeCase } from '../utils';

import type { Attribute } from './snake';
import type { AttributeCamel } from './camel';

export type AttributeCase = MakeCase<Attribute, AttributeCamel>;

export type { Attribute, AttributeCamel };
