import type { ConvertSnakeToCamelCase } from '../index.js';
import type { Replace } from '../utils.js';

import type { Consent, ConsentEffective, ConsentInput } from './snake.js';

export type ConsentInputCamel = ConvertSnakeToCamelCase<ConsentInput>;

export type ConsentEffectiveCamel = ConvertSnakeToCamelCase<ConsentEffective>;

export type ConsentCamel = ConvertSnakeToCamelCase<
  Replace<
    Consent,
    {
      effective: ConsentEffectiveCamel;
    }
  >
>;
