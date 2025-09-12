import type { MakeCase } from '../utils';

import type { Account, Address, PasswordTokenInput } from './snake';

import type {
  AccountCamel,
  AddressCamel,
  PasswordTokenInputCamel,
} from './camel';

export type PasswordTokenInputCase = MakeCase<
  PasswordTokenInput,
  PasswordTokenInputCamel
>;

export type AddressCase = MakeCase<Address, AddressCamel>;
export type AccountCase = MakeCase<Account, AccountCamel>;

export type {
  Account,
  Address,
  PasswordTokenInput,
  AccountCamel,
  AddressCamel,
  PasswordTokenInputCamel,
};
