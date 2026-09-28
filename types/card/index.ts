import type { MakeCase } from '../utils.js';

import type { InputCreateToken, TokenResponse, Card } from './snake.js';

import type {
  InputCreateTokenCamel,
  TokenResponseCamel,
  CardCamel,
} from './camel.js';

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
