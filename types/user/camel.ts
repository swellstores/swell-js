import type { ConvertSnakeToCamelCase } from '..';
import type { User } from './snake';

export type UserCamel = ConvertSnakeToCamelCase<User>;
