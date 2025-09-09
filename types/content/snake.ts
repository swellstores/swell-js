import type { BaseModel } from '..';

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
