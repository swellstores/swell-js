import type { ConvertSnakeToCamelCase } from '../index.js';
import type { User } from './snake.js';

export type UserCamel = ConvertSnakeToCamelCase<User>;
