import type { ConvertSnakeToCamelCase } from '..';
import type { Replace } from '../utils';

import type { AccountCamel } from '../account/camel';
import type { BillingCamel } from '../billing/camel';

import type { InputCreateToken, TokenResponse, Card } from './snake';

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
