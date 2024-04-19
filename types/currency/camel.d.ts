import { ConvertSnakeToCamelCase } from '..';

import {
  FormatInputSnake,
  SelectCurrencyReturnSnake,
  EnabledCurrencySnake,
} from './snake';

export type FormatInputCamel = ConvertSnakeToCamelCase<FormatInputSnake>;

export type SelectCurrencyReturnCamel =
  ConvertSnakeToCamelCase<SelectCurrencyReturnSnake>;

export type EnabledCurrencyCamel =
  ConvertSnakeToCamelCase<EnabledCurrencySnake>;
