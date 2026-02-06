import type { MakeCase } from '../utils';

import type {
  Content,
  ContentSection,
  ContentPage,
  ContentBlog,
  ContentBlogCategory,
} from './snake';
import type {
  ContentCamel,
  ContentSectionCamel,
  ContentPageCamel,
  ContentBlogCamel,
  ContentBlogCategoryCamel,
} from './camel';

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
