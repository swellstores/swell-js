import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';

import type { ProductCamel } from '../product/camel';

import type { Attribute } from './snake';

export type AttributeCamel = ConvertSnakeToCamelCase<
  Replace<
    Attribute,
    {
      products?: ResultsResponseCamel<ProductCamel>;
    }
  >
>;
