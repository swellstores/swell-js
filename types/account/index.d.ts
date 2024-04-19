import { AccountSnake, AddressSnake, PasswordTokenInputSnake } from './snake';
import { AccountCamel, AddressCamel, PasswordTokenInputCamel } from './camel';

export interface PasswordTokenInput
  extends PasswordTokenInputSnake,
    PasswordTokenInputCamel {}

export interface Account extends AccountSnake, AccountCamel {}
export interface Address extends AddressSnake, AddressCamel {}
