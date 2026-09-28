import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type { AccountCamel } from '../account/camel.js';
import type { BillingCamel } from '../billing/camel.js';

import type { InputCreateToken, TokenResponse, Card } from './snake.js';

export type CardCamel = ConvertSnakeToCamelCase<
  Replace<
    Card,
    {
      billing?: BillingCamel;
      parent?: AccountCamel;
    }
  >
>;

export type InputCreateTokenCamel = ConvertSnakeToCamelCase<
  Replace<
    InputCreateToken,
    {
      billing?: BillingCamel;
    }
  >
>;

export type TokenResponseCamel = ConvertSnakeToCamelCase<TokenResponse>;
