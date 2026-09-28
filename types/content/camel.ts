import type { ConvertSnakeToCamelCase, ImageCamel } from '../index.js';
import type { Replace } from '../utils.js';

import type { CategoryCamel } from '../category/index.js';
import type { UserCamel } from '../user/index.js';

import type {
  Content,
  ContentSection,
  ContentPage,
  ContentBlog,
  ContentBlogCategory,
} from './snake.js';

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
