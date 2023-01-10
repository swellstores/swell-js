import {
  SelectCurrencyReturnSnake,
  EnabledCurrencySnake,
  FormatInputSnake,
} from './snake';
import {
  SelectCurrencyReturnCamel,
  EnabledCurrencyCamel,
  FormatInputCamel,
} from './camel';

export interface SelectCurrencyReturn
  extends SelectCurrencyReturnSnake,
    SelectCurrencyReturnCamel {}
export interface EnabledCurrency
  extends EnabledCurrencySnake,
    EnabledCurrencyCamel {}
export interface FormatInput extends FormatInputSnake, FormatInputCamel {}
