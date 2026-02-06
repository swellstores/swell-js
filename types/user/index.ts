import type { MakeCase } from '../utils';

import type { User } from './snake';
import type { UserCamel } from './camel';

export type UserCase = MakeCase<User, UserCamel>;

export type { User, UserCamel };
