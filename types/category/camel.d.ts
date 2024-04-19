import { ConvertSnakeToCamelCase } from '..';
import { CategorySnake } from './snake';

export type CategoryCamel = ConvertSnakeToCamelCase<CategorySnake>;
