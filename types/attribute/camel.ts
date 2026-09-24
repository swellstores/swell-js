import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
} from '../index.js';
import type { Replace } from '../utils.js';

import type { ProductCamel } from '../product/camel.js';

import type { Attribute } from './snake.js';

export type AttributeCamel = ConvertSnakeToCamelCase<
  Replace<
    Attribute,
    {
      products?: ResultsResponseCamel<ProductCamel>;
    }
  >
>;
