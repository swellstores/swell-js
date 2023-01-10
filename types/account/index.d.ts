import { AccountSnake, AddressSnake, PasswordTokenInputSnake } from './snake';
import { AccountCamel, AddressCamel, PasswordTokenInputCamel } from './camel';

interface PasswordTokenInput
  extends PasswordTokenInputSnake,
    PasswordTokenInputCamel {}
interface Account extends AccountSnake, AccountCamel {}
interface Address extends AddressSnake, AddressCamel {}
