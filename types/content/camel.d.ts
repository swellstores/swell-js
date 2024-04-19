import { ConvertSnakeToCamelCase } from '..';
import { ContentSnake, ContentSectionSnake } from './snake';

export type ContentCamel = ConvertSnakeToCamelCase<ContentSnake>;
export type ContentSectionCamel = ConvertSnakeToCamelCase<ContentSectionSnake>;
