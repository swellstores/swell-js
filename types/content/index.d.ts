import { ContentSnake, ContentSectionSnake } from './snake';
import { ContentCamel, ContentSectionCamel } from './camel';

export interface Content extends ContentSnake, ContentCamel {}
export interface ContentSection
  extends ContentSectionSnake,
    ContentSectionCamel {}
