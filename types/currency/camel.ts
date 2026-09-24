import type { ConvertSnakeToCamelCase } from '../index.js';

import type {
  SelectCurrencyReturn,
  EnabledCurrency,
  FormatInput,
} from './snake.js';

export type FormatInputCamel = ConvertSnakeToCamelCase<FormatInput>;

export type SelectCurrencyReturnCamel =
  ConvertSnakeToCamelCase<SelectCurrencyReturn>;

export type EnabledCurrencyCamel = ConvertSnakeToCamelCase<EnabledCurrency>;
