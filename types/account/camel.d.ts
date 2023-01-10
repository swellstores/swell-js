import { SnakeToCamelCase } from '..';
import { PasswordTokenInputSnake, AccountSnake, AddressSnake } from './snake';

export type PasswordTokenInputCamel = {
  [K in keyof PasswordTokenInputSnake as SnakeToCamelCase<K>]: PasswordTokenInputSnake[K];
};
export type AccountCamel = {
  [K in keyof AccountSnake as SnakeToCamelCase<K>]: AccountSnake[K];
};
export type AddressCamel = {
  [K in keyof AddressSnake as SnakeToCamelCase<K>]: AddressSnake[K];
};
