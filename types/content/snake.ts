import type { BaseModel, Image } from '..';

import type { Category } from '../category';
import type { User } from '../user';

export interface ContentSection {
  id: string;
  type: string;
  [otherAttr: string]: string | number | boolean | null;
}

export interface Content extends BaseModel {
  content?: string;
  meta_description?: string | null;
  name?: string;
  published?: boolean;
  redirect?: string | null;
  slug?: string;
  sections?: ContentSection[];
}

export interface ContentPage extends BaseModel {
  title: string;
  slug: string;
  name?: string;
  content?: string;
  published?: boolean;
  date_published?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  theme_template?: string;
}

export interface ContentBlog extends BaseModel {
  title: string;
  slug: string;
  author_id: string;
  author?: User;
  category_id: string;
  category?: Category;
  content?: string;
  summary?: string;
  image?: Image;
  tags?: string[];
  published?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  theme_template?: string;
}

export interface ContentBlogCategory extends BaseModel {
  title: string;
  slug: string;
  blogs?: ContentBlog[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}
