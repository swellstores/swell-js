import type { MakeCase } from '../utils.js';

import type {
  SelectCurrencyReturn,
  EnabledCurrency,
  FormatInput,
} from './snake.js';

import type {
  SelectCurrencyReturnCamel,
  EnabledCurrencyCamel,
  FormatInputCamel,
} from './camel.js';

export type SelectCurrencyReturnCase = MakeCase<
  SelectCurrencyReturn,
  SelectCurrencyReturnCamel
>;

export type EnabledCurrencyCase = MakeCase<
  EnabledCurrency,
  EnabledCurrencyCamel
>;

export type FormatInputCase = MakeCase<FormatInput, FormatInputCamel>;

export type {
  SelectCurrencyReturn,
  EnabledCurrency,
  FormatInput,
  SelectCurrencyReturnCamel,
  EnabledCurrencyCamel,
  FormatInputCamel,
};
