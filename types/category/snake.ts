import type { BaseModel, ResultsResponse } from '..';

import type { Image, Product } from '../product';

export interface Category extends BaseModel {
  active?: boolean;
  children?: ResultsResponse<Category>;
  demo?: boolean;
  description: string;
  image?: Image;
  images?: Image[];
  meta_description?: string;
  meta_keywords?: string;
  meta_title?: string;
  name: string;
  parent_id?: string;
  parent?: Category;
  products?: ResultsResponse<Product>;
  products_indexed?: ResultsResponse<Product>;
  slug: string;
  sort?: number;
  sorting?: string;
  top?: Category;
  top_id?: string;
}
