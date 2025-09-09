import type { ConvertSnakeToCamelCase } from '..';

import type {
  SelectCurrencyReturn,
  EnabledCurrency,
  FormatInput,
} from './snake';

export type FormatInputCamel = ConvertSnakeToCamelCase<FormatInput>;

export type SelectCurrencyReturnCamel =
  ConvertSnakeToCamelCase<SelectCurrencyReturn>;

export type EnabledCurrencyCamel = ConvertSnakeToCamelCase<EnabledCurrency>;
