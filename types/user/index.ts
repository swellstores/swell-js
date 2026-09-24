import type { MakeCase } from '../utils.js';

import type { User } from './snake.js';
import type { UserCamel } from './camel.js';

export type UserCase = MakeCase<User, UserCamel>;

export type { User, UserCamel };
