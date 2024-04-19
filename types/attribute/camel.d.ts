import { ConvertSnakeToCamelCase } from '..';
import { AttributeSnake } from './snake';

export type AttributeCamel = ConvertSnakeToCamelCase<AttributeSnake>;
