import type { MakeCase } from '../utils.js';

import type {
  Content,
  ContentSection,
  ContentPage,
  ContentBlog,
  ContentBlogCategory,
} from './snake.js';
import type {
  ContentCamel,
  ContentSectionCamel,
  ContentPageCamel,
  ContentBlogCamel,
  ContentBlogCategoryCamel,
} from './camel.js';

export type ContentCase = MakeCase<Content, ContentCamel>;
export type ContentSectionCase = MakeCase<ContentSection, ContentSectionCamel>;
export type ContentPageCase = MakeCase<ContentPage, ContentPageCamel>;
export type ContentBlogCase = MakeCase<ContentBlog, ContentBlogCamel>;
export type ContentBlogCategoryCase = MakeCase<
  ContentBlogCategory,
  ContentBlogCategoryCamel
>;

export type {
  Content,
  ContentSection,
  ContentPage,
  ContentBlog,
  ContentBlogCategory,
  ContentCamel,
  ContentSectionCamel,
  ContentPageCamel,
  ContentBlogCamel,
  ContentBlogCategoryCamel,
};
