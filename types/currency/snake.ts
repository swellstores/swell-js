export interface FormatInput {
  code: string;
  decimals: number;
  locale: string;
  rate: number;
}

export interface EnabledCurrency {
  code: string;
  decimals: number;
  name: string;
  rate: number;
  symbol: string;
  type: string;
}

export interface SelectCurrencyReturn {
  account_id?: string;
  cart_id?: string;
  currency: string;
  public_key?: string;
}
