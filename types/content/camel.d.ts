import { SnakeToCamelCase } from '..';
import { ContentSnake, ContentSectionSnake } from './snake';

export type ContentCamel = {
  [K in keyof ContentSnake as SnakeToCamelCase<K>]: ContentSnake[K];
};
export type ContentSectionCamel = {
  [K in keyof ContentSectionSnake as SnakeToCamelCase<K>]: ContentSectionSnake[K];
};
