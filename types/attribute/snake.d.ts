import { BaseModel, ResultsResponse } from '..';

import { Product } from '../product';

export interface AttributeSnake extends BaseModel {
  default?: string | null | number | boolean | object;
  filterable?: boolean;
  localized?: boolean;
  multi?: boolean;
  name?: string;
  products?: ResultsResponse<Product>;
  required?: boolean;
  searchable?: boolean;
  type?:
    | 'asset'
    | 'boolean'
    | 'checkbox'
    | 'collection'
    | 'date'
    | 'currency'
    | 'dropdown'
    | 'field_group'
    | 'file'
    | 'icon'
    | 'image'
    | 'long_text'
    | 'lookup'
    | 'number'
    | 'radio'
    | 'select'
    | 'short_text'
    | 'tags'
    | 'text'
    | 'textarea';
  value?: unknown;
  variant?: boolean;
  visible?: boolean;
}
