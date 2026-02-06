// Type definitions for swell-js
// Project: https://github.com/swellstores/swell-js#readme
// Thanks to contributor Gus Fune <https://github.com/gusfune>
// Credit Stackoverflow user ford04 for SnakeToCamelCase function
// https://stackoverflow.com/questions/60269936/typescript-convert-generic-object-from-snake-to-camel-case

import type {
  AccountCase,
  AddressCase,
  PasswordTokenInputCase,
} from './account';
import type { AttributeCase } from './attribute';
import type { CardCase, InputCreateTokenCase, TokenResponseCase } from './card';
import type { CartCase, CartItemCase } from './cart';
import type { CategoryCase } from './category';
import type { ContentCase } from './content';
import type {
  SelectCurrencyReturnCase,
  EnabledCurrencyCase,
  FormatInputCase,
} from './currency';
import type { InvoiceCase } from './invoice';
import type { Locale } from './locale';
import type { OrderCase } from './order';
import type {
  ProductCase,
  FlexibleProductInputCase,
  PriceRange,
} from './product';

import type {
  InputPaymentElementCardCase,
  InputPaymentElementIdealCase,
  InputPaymentElementPaypalCase,
  InputPaymentElementGoogleCase,
  InputPaymentElementAppleCase,
  InputPaymentElementSezzleCase,
  InputPaymentRedirectCase,
  PaymentCase,
} from './payment';

import type { Settings } from './settings';
import type { SubscriptionCase } from './subscription';
import type { MakeCase } from './utils';

export type * from './account';
export type * from './attribute';
export type * from './billing';
export type * from './card';
export type * from './cart';
export type * from './category';
export type * from './content';
export type * from './coupon';
export type * from './currency';
export type * from './discount';
export type * from './giftcard';
export type * from './invoice';
export type * from './locale';
export type * from './order';
export type * from './payment';
export type * from './product';
export type * from './promotion';
export type * from './purchase_link';
export type * from './refund';
export type * from './settings';
export type * from './shipment_rating';
export type * from './subscription';

export type SnakeToCamelCase<S> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export type ConvertSnakeToCamelCase<T> = {
  [K in keyof T as SnakeToCamelCase<K>]: T[K];
};

export interface BaseModel {
  id?: string;
  date_created?: string;
  date_updated?: string;
}

export interface Query {
  limit?: number;
  page?: number;
  where?: Record<string, unknown>;
  expand?: string[] | string;
  search?: string;
  [key: string]: unknown;
}

export interface IncludeQuery {
  [key: string]: {
    url: string;
    data?: Query;
    params?: Query;
  };
}

export interface InitOptions<C extends 'snake' | 'camel' = 'snake'> {
  currency?: string;
  key?: string;
  locale?: string;
  previewContent?: boolean;
  session?: string;
  store?: string;
  timeout?: number;
  useCamelCase?: boolean;
  url?: string;
  vaultUrl?: string;
  setCookie?: (key: string, value: string) => void;
  getCookie?: (key: string) => string | undefined;
  headers?: Record<string, string>;
  getCart?: () => Promise<CartCase[C] | null>;
  /**
   * When overriding `updateCart` you should throw an exception
   * if the server returns an error, instead of silently returning the error.
   * This is necessary for the correct processing of payment forms
   * and payment integrations such as Google Pay and Apple Pay.
   */
  updateCart?: (input: object) => Promise<CartCase[C] | null>;
}

export interface InitOptionsCamel extends InitOptions<'camel'> {
  useCamelCase: true;
}

export interface ResultsResponse<T> {
  count: number;
  limit: number;
  page: number;
  pages?: Record<
    number,
    {
      start: number;
      end: number;
    }
  >;
  page_count?: number;
  results: T[];
}

export type ResultsResponseCamel<T> = ConvertSnakeToCamelCase<
  ResultsResponse<T>
>;

type ResultsResponseCase<T> = MakeCase<
  ResultsResponse<T>,
  ResultsResponseCamel<T>
>;

export interface Tax {
  id?: string;
  name?: string;
  amount?: number;
  priority?: number;
  rate?: number;
}

export interface ItemDiscount {
  id?: string;
  amount?: number;
}

export interface Image {
  caption?: string;
  file?: {
    content_type?: string;
    date_uploaded?: string;
    filename?: string;
    height?: number;
    length?: number;
    metadata?: object;
    md5?: string;
    private?: boolean;
    url?: string;
    width?: number;
  };
  id?: string;
}

export type ImageCamel = ConvertSnakeToCamelCase<Image>;

export interface SwellError {
  code: string;
  message: string;
}

export interface ServerError {
  error: SwellError;
}

export interface ErrorResponse {
  errors: Record<string, SwellError | undefined>;
}

export interface ProductQuery extends Query {
  category?: string;
  categories?: string[];
  $filters?: unknown;
}

export interface SwellClient<C extends 'snake' | 'camel' = 'snake'> {
  version: string;

  init(storeId: string, publicKey: string, options?: InitOptions<C>): void;

  account: {
    create(input: AccountCase[C]): Promise<AccountCase[C] | ErrorResponse>;

    login(
      user: string,
      password: string | PasswordTokenInputCase[C],
    ): Promise<AccountCase[C] | null>;

    logout(): Promise<unknown>;
    recover(input: object): Promise<AccountCase[C] | ErrorResponse>;
    update(input: AccountCase[C]): Promise<AccountCase[C] | ErrorResponse>;
    get(query?: object): Promise<AccountCase[C] | null>;

    listAddresses(
      input?: object,
    ): Promise<ResultsResponseCase<AddressCase[C]>[C]>;

    /** @deprecated use `listAddresses` instead */
    getAddresses(
      input?: object,
    ): Promise<ResultsResponseCase<AddressCase[C]>[C]>;

    createAddress(
      input: AddressCase[C],
    ): Promise<AddressCase[C] | ErrorResponse>;

    updateAddress(
      id: string,
      input: AddressCase[C],
    ): Promise<AddressCase[C] | ErrorResponse>;

    deleteAddress(id: string): Promise<AddressCase[C] | null>;

    listCards(query?: object): Promise<ResultsResponseCase<CardCase[C]>[C]>;
    /** @deprecated use `listCards` instead */
    getCards(query?: object): Promise<ResultsResponseCase<CardCase[C]>[C]>;
    createCard(input: CardCase[C]): Promise<CardCase[C] | ErrorResponse>;

    updateCard(
      id: string,
      input: CardCase[C],
    ): Promise<CardCase[C] | ErrorResponse>;

    deleteCard(id: string): Promise<CardCase[C] | null>;

    listOrders(query?: object): Promise<ResultsResponseCase<OrderCase[C]>[C]>;
    /** @deprecated use `listOrders` instead */
    getOrders(query?: object): Promise<ResultsResponseCase<OrderCase[C]>[C]>;
    getOrder(id: string): Promise<OrderCase[C] | null>;
  };

  attributes: {
    get(id: string, query?: object): Promise<AttributeCase[C] | null>;
    list(query?: object): Promise<ResultsResponseCase<AttributeCase[C]>[C]>;
  };

  card: {
    createToken(input: InputCreateTokenCase[C]): Promise<TokenResponseCase[C]>;
    validateCVC(code: string): boolean;
    validateExpiry(month: string, year: string): boolean;
    validateNumber(cardNumber: string): boolean;
  };

  cart: {
    get(): Promise<CartCase[C] | null>;
    update(input: object): Promise<CartCase[C] | null>;
    recover(input: string): Promise<CartCase[C]>;

    getSettings(): Promise<Settings>;
    getShippingRates(): Promise<CartCase[C]>;

    addItem(
      input: Partial<CartItemCase[C]>,
    ): Promise<CartCase[C] | ErrorResponse>;

    setItems(
      input: Partial<CartItemCase[C]>[],
    ): Promise<CartCase[C] | ErrorResponse>;

    removeItem(id: string): Promise<CartCase[C] | ErrorResponse>;

    updateItem(
      id: string,
      input: Partial<CartItemCase[C]>,
    ): Promise<CartCase[C] | ErrorResponse>;

    applyCoupon(code: string): Promise<CartCase[C]>;
    removeCoupon(): Promise<CartCase[C]>;

    applyGiftcard(code: string): Promise<CartCase[C]>;
    removeGiftcard(id: string): Promise<CartCase[C]>;

    submitOrder(): Promise<OrderCase[C]>;
    getOrder(checkoutId?: string): Promise<OrderCase[C]>;
  };

  categories: {
    get(id: string, query?: object): Promise<CategoryCase[C] | null>;
    list(query?: object): Promise<ResultsResponseCase<CategoryCase[C]>[C]>;
  };

  content: {
    get(
      type: string,
      id: string,
      query?: Query,
    ): Promise<ContentCase[C] | ResultsResponseCase<ContentCase[C]>[C]>;

    list(
      type: string,
      query?: Query,
    ): Promise<ResultsResponseCase<ContentCase[C]>[C]>;
  };

  currency: {
    format(amount: number, format: FormatInputCase[C]): string;
    set(code?: string): EnabledCurrencyCase[C];
    get(): EnabledCurrencyCase[C];
    list(): EnabledCurrencyCase[C][] | Promise<EnabledCurrencyCase[C][]>;
    select(currency: string): Promise<SelectCurrencyReturnCase[C]>;
    selected(): string;
  };

  locale: {
    get(): Locale;
    set(code: string): Locale;
    list(): Locale[] | Promise<Locale[]>;
    select(locale: string): Promise<{ locale: string }>;
    selected(): string;
  };

  payment: {
    get(id: string): Promise<PaymentCase[C]>;
    methods(): Promise<object>;

    createElements(input: {
      card?: InputPaymentElementCardCase[C];
      ideal?: InputPaymentElementIdealCase[C];
      paypal?: InputPaymentElementPaypalCase[C];
      google?: InputPaymentElementGoogleCase[C];
      apple?: InputPaymentElementAppleCase[C];
      sezzle?: InputPaymentElementSezzleCase[C];
    }): Promise<void>;

    tokenize(input?: {
      card?: object;
      ideal?: object;
      klarna?: object;
      bancontact?: object;
      paysafecard?: object;
      amazon?: object;
    }): Promise<void>;

    handleRedirect(input?: {
      card?: InputPaymentRedirectCase[C];
      paysafecard?: InputPaymentRedirectCase[C];
      klarna?: InputPaymentRedirectCase[C];
      bancontact?: InputPaymentRedirectCase[C];
    }): Promise<void>;

    authenticate(id: string): Promise<object | { error: Error }>;
    resetAsyncPayment(id: string): Promise<object>;

    createIntent(input: { gateway: string; intent: object }): Promise<object>;

    updateIntent(input: { gateway: string; intent: object }): Promise<object>;

    authorizeGateway(input: {
      gateway: string;
      params?: object;
    }): Promise<object>;
  };

  products: {
    categories(products: FlexibleProductInputCase[C]): CategoryCase[C][];

    filters(products: FlexibleProductInputCase[C], options?: object): object[];

    filterableAttributeFilters(
      products: ProductCase[C][],
      options?: object,
    ): Promise<object[]>;

    get(id: string, query?: ProductQuery): Promise<ProductCase[C]>;
    list(query?: ProductQuery): Promise<ResultsResponseCase<ProductCase[C]>[C]>;
    priceRange(product: FlexibleProductInputCase[C]): PriceRange;

    attributes(products: FlexibleProductInputCase[C]): AttributeCase[C][];

    variation(
      product: ProductCase[C],
      options: object,
      purchaseOption?: object,
    ): ProductCase[C];
  };

  settings: {
    get(
      id?: string,
      defaultValue?: string | number | Settings,
    ): Settings | Promise<Settings>;

    refresh(): Promise<Settings>;
    getCurrentLocale(): string;
    getStoreLocale(): string;
    getStoreLocales(): Locale[];
    load(): Promise<void>;

    menus(id?: string, defaultValue?: unknown): Settings | Promise<Settings>;

    payments(
      id?: string,
      defaultValue?: string | number | Settings,
    ): Settings | Promise<Settings>;

    subscriptions(
      id?: string,
      defaultValue?: string | number | Settings,
    ): Settings | Promise<Settings>;

    session(
      id?: string,
      defaultValue?: string | number | Settings,
    ): Settings | Promise<Settings>;
  };

  subscriptions: {
    create(input: object): Promise<SubscriptionCase[C] | ErrorResponse>;

    update(
      id: string,
      input: object,
    ): Promise<SubscriptionCase[C] | ErrorResponse>;

    list(query?: object): Promise<ResultsResponseCase<SubscriptionCase[C]>[C]>;
    get(id: string, query?: object): Promise<SubscriptionCase[C] | null>;

    addItem(
      id: string,
      input: object,
    ): Promise<SubscriptionCase[C] | ErrorResponse>;

    setItems(
      id: string,
      input: object[],
    ): Promise<SubscriptionCase[C] | ErrorResponse>;

    updateItem(
      id: string,
      itemId: string,
      input: object,
    ): Promise<SubscriptionCase[C] | ErrorResponse>;

    removeItem(
      id: string,
      itemId: string,
    ): Promise<SubscriptionCase[C] | ErrorResponse>;
  };

  invoices: {
    get(id: string, query?: object): Promise<InvoiceCase[C] | null>;
    list(query?: object): Promise<ResultsResponseCase<InvoiceCase[C]>[C]>;
  };

  session: {
    get(): Promise<Record<string, unknown>>;
    getCookie(): string | undefined;
    setCookie(value: string): void;
  };

  functions: {
    request<T>(
      method: string,
      appId: string,
      functionName: string,
      data?: unknown,
      options?: unknown,
    ): Promise<T>;

    get(
      appId: string,
      functionName: string,
      data?: unknown,
      options?: unknown,
    ): Promise<object | null>;

    put(
      appId: string,
      functionName: string,
      data?: unknown,
      options?: unknown,
    ): Promise<object>;

    post(
      appId: string,
      functionName: string,
      data?: unknown,
      options?: unknown,
    ): Promise<object>;
  };

  utils: {
    get: typeof import('lodash-es/get').default;
    set: typeof import('lodash-es/set').default;
    uniq: typeof import('lodash-es/uniq').default;
    find: typeof import('lodash-es/find').default;
    round: typeof import('lodash-es/round').default;
    pick: typeof import('lodash-es/pick').default;
    findIndex: typeof import('lodash-es/findIndex').default;
    cloneDeep: typeof import('lodash-es/cloneDeep').default;
    toNumber: typeof import('lodash-es/toNumber').default;
    toLower: typeof import('lodash-es/toLower').default;
    isEqual: typeof import('lodash-es/isEqual').default;
    isEmpty: typeof import('lodash-es/isEmpty').default;
    merge: typeof import('deepmerge');

    map<T, R>(arr: T[], mapper: (item: T) => R): R[];

    reduce<T, R>(
      arr: T[],
      reducer: (acc: R, item: T, index: number) => R,
      init: R,
    ): R;

    toSnake<T, R>(obj: T): R;
    toCamel<T, R>(obj: T): R;
    snakeCase(str: string): string;
    camelCase(str: string): string;
    trimStart(str: string): string;
    trimBoth(str: string): string;
    trimEnd(str: string): string;
    stringifyQuery(query: object): string;
    base64Encode(input: string): string;
  };

  // Backward compatible functions

  auth: SwellClient<C>['init'];

  request<T>(
    method: string,
    url: string,
    id?: string,
    data?: unknown,
    options?: unknown,
  ): Promise<T>;

  get<T>(url: string, query?: Query): Promise<T>;
  put<T>(url: string, data?: unknown): Promise<T>;
  post<T>(url: string, data?: unknown): Promise<T>;

  delete<T>(url: string, data?: unknown): Promise<T>;

  getCookie(key: string): string | undefined;
  setCookie(key: string, value: string, options?: Record<string, string>): void;
}

export interface SwellClientDefault<C extends 'snake' | 'camel'>
  extends SwellClient<C> {
  create<C extends 'snake' | 'camel' = 'snake'>(
    store?: string,
    key?: string,
    options?: InitOptions<C>,
  ): SwellClient<C>;

  create(
    store?: string,
    key?: string,
    options?: InitOptionsCamel,
  ): SwellClient<'camel'>;

  default: SwellClientDefault<'snake'>;
}

declare const swell: SwellClientDefault<'snake'>;

export as namespace swell;
export = swell;
