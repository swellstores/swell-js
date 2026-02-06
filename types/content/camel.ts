import type { ConvertSnakeToCamelCase, ImageCamel } from '..';
import type { Replace } from '../utils';

import type { CategoryCamel } from '../category';
import type { UserCamel } from '../user';

import type {
  Content,
  ContentSection,
  ContentPage,
  ContentBlog,
  ContentBlogCategory,
} from './snake';

export type ContentCamel = ConvertSnakeToCamelCase<Content>;
export type ContentSectionCamel = ConvertSnakeToCamelCase<ContentSection>;
export type ContentPageCamel = ConvertSnakeToCamelCase<ContentPage>;

export type ContentBlogCamel = ConvertSnakeToCamelCase<
  Replace<
    ContentBlog,
    {
      author?: UserCamel;
      category?: CategoryCamel;
      image?: ImageCamel;
    }
  >
>;

export type ContentBlogCategoryCamel = ConvertSnakeToCamelCase<
  Replace<
    ContentBlogCategory,
    {
      blogs?: ContentBlogCamel[];
    }
  >
>;
