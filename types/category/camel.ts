import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';

import type { ProductCamel, ImageCamel } from '../product/camel';

import type { Category } from './snake';

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
