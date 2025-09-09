import type { ConvertSnakeToCamelCase } from '..';

import type { Content, ContentSection } from './snake';

export type ContentCamel = ConvertSnakeToCamelCase<Content>;
export type ContentSectionCamel = ConvertSnakeToCamelCase<ContentSection>;
