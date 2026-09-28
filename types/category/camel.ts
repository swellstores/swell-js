import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
  ImageCamel,
} from '../index.js';
import type { Replace } from '../utils.js';

import type { ProductCamel } from '../product/camel.js';

import type { Category } from './snake.js';

export type CategoryCamel = ConvertSnakeToCamelCase<
  Replace<
    Category,
    {
      children?: ResultsResponseCamel<CategoryCamel>;
      image?: ImageCamel;
      images?: ImageCamel[];
      parent?: CategoryCamel;
      products?: ResultsResponseCamel<ProductCamel>;
      products_indexed?: ResultsResponseCamel<ProductCamel>;
      top?: CategoryCamel;
    }
  >
>;
