import { BaseModel } from '..';
import { Account } from '../account';

interface InputCreateTokenSnake {
  account_id?: string;
  billing?: object; // TODO: Add billing
  cvc?: number;
  exp_month?: number;
  exp_year?: number;
  number?: string;
}

interface TokenResponseSnake {
  address_check?: 'pass' | 'failed' | 'checked' | 'unchecked';
  brand?: string;
  cvc_check?: 'pass' | 'failed' | 'checked' | 'unchecked';
  exp_month?: number;
  exp_year?: number;
  last4?: string;
  token?: string;
  zip_check?: 'pass' | 'failed' | 'checked' | 'unchecked';
}

interface CardSnake extends BaseModel {
  active?: boolean;
  address_check?: 'unchecked' | 'pass' | 'fail';
  billing?: object; // TODO: Create Billing Interface
  brand?: string;
  cvc_check?: 'unchecked' | 'pass' | 'fail';
  exp_month?: number;
  exp_year?: number;
  fingerprint?: string;
  gateway?: string;
  last4?: string;
  parent?: Account;
  parent_id?: string;
  test?: boolean;
  token: string;
  zip_check?: 'unchecked' | 'pass' | 'fail';
}
