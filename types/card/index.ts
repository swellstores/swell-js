import type { MakeCase } from '../utils';

import type { InputCreateToken, TokenResponse, Card } from './snake';

import type {
  InputCreateTokenCamel,
  TokenResponseCamel,
  CardCamel,
} from './camel';

export type InputCreateTokenCase = MakeCase<
  InputCreateToken,
  InputCreateTokenCamel
>;

export type TokenResponseCase = MakeCase<TokenResponse, TokenResponseCamel>;
export type CardCase = MakeCase<Card, CardCamel>;

export type {
  InputCreateToken,
  TokenResponse,
  Card,
  InputCreateTokenCamel,
  TokenResponseCamel,
  CardCamel,
};
