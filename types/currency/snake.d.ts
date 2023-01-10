export interface FormatInputSnake {
  code: string;
  decimals: number;
  locale: string;
  rate: number;
}

export interface EnabledCurrencySnake {
  code: string;
  decimals: number;
  name: string;
  rate: number;
  symbol: string;
  type: string;
}

export interface SelectCurrencyReturnSnake {
  account_id?: string;
  cart_id?: string;
  currency: string;
  public_key?: string;
}
