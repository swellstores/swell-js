import type { MakeCase } from '../utils';

import type { Content, ContentSection } from './snake';
import type { ContentCamel, ContentSectionCamel } from './camel';

export type ContentCase = MakeCase<Content, ContentCamel>;

export type { Content, ContentSection, ContentCamel, ContentSectionCamel };
