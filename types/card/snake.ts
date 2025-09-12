import type { BaseModel } from '..';

import type { Account } from '../account';
import type { Billing } from '../billing';

export interface InputCreateToken {
  account_id?: string;
  billing?: Billing;
  cvc?: string;
  exp_month?: number;
  exp_year?: number;
  number?: string;
}

export interface TokenResponse {
  address_check?: 'pass' | 'failed' | 'checked' | 'unchecked';
  brand?: string;
  cvc_check?: 'pass' | 'failed' | 'checked' | 'unchecked';
  exp_month?: number;
  exp_year?: number;
  last4?: string;
  token?: string;
  zip_check?: 'pass' | 'failed' | 'checked' | 'unchecked';
}

export interface Card extends BaseModel {
  active?: boolean;
  address_check?: 'unchecked' | 'pass' | 'fail';
  billing?: Billing;
  brand?: string;
  display_brand?: string;
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
