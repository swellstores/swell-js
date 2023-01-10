import { BaseModel } from '..';

interface ContentSectionSnake {
  id: string;
  type: string;
  [otherAttr: string]: string | number | boolean | null;
}
interface ContentSnake extends BaseModel {
  content?: string;
  meta_description?: string | null;
  name?: string;
  published?: boolean;
  redirect?: string | null;
  slug?: string;
  sections?: ContentSectionSnake[];
}
