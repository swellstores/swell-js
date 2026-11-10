import type { MakeCase } from '../utils.js';

import type { Consent, ConsentEffective, ConsentInput } from './snake.js';
import type {
  ConsentCamel,
  ConsentEffectiveCamel,
  ConsentInputCamel,
} from './camel.js';

export type ConsentCase = MakeCase<Consent, ConsentCamel>;

export type ConsentInputCase = MakeCase<ConsentInput, ConsentInputCamel>;

export type {
  Consent,
  ConsentEffective,
  ConsentInput,
  ConsentCamel,
  ConsentEffectiveCamel,
  ConsentInputCamel,
};
