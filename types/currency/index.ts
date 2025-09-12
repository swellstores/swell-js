import type { MakeCase } from '../utils';

import type {
  SelectCurrencyReturn,
  EnabledCurrency,
  FormatInput,
} from './snake';

import type {
  SelectCurrencyReturnCamel,
  EnabledCurrencyCamel,
  FormatInputCamel,
} from './camel';

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
