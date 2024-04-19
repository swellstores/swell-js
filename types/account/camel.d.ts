import { ConvertSnakeToCamelCase } from '..';
import { PasswordTokenInputSnake, AccountSnake, AddressSnake } from './snake';

export type PasswordTokenInputCamel =
  ConvertSnakeToCamelCase<PasswordTokenInputSnake>;

export type AccountCamel = ConvertSnakeToCamelCase<AccountSnake>;
export type AddressCamel = ConvertSnakeToCamelCase<AddressSnake>;
