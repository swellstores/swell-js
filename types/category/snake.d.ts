import { BaseModel } from '..';
import { Image, Product } from '../product';

interface CategorySnake extends BaseModel {
  active?: boolean;
  children?: CategorySnake[];
  demo?: boolean;
  description: string;
  image?: Image;
  images?: Image[];
  meta_description?: string;
  meta_keywords?: string;
  meta_title?: string;
  name: string;
  parent_id?: string;
  parent?: CategorySnake;
  products?: Product[];
  products_indexed?: Product[];
  slug: string;
  sort?: number;
  sorting?: string;
  top?: CategorySnake;
  top_id?: string;
}
