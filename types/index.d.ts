// Type definitions for swell-js
// Project: https://github.com/swellstores/swell-js#readme
// Thanks to contributor Gus Fune <https://github.com/gusfune>
// Credit Stackoverflow user ford04 for SnakeToCamelCase function
// https://stackoverflow.com/questions/60269936/typescript-convert-generic-object-from-snake-to-camel-case

import { Account, Address, PasswordTokenInput } from './account';
import { Attribute } from './attribute';
import { Card, InputCreateToken, TokenResponse } from './card';
import { Cart, CartItem } from './cart';
import { Content } from './content';
import { EnabledCurrency, FormatInput, SelectCurrencyReturn } from './currency';
import { Category } from './category';
import { Locale } from './locale';
import { Order } from './order';
import { Product, FlexibleProductInput, PriceRange } from './product';

import {
  InputPaymentElementCard,
  InputPaymentElementIdeal,
  InputPaymentElementPaypal,
  InputPaymentElementGoogle,
  InputPaymentElementApple,
  Payment,
  InputPaymentRedirect,
} from './payment';

import { Settings } from './settings';
import { Subscription } from './subscription';
import { Invoice } from './invoice';
import { ShipmentRating } from './shipment_rating';

export * from './account';
export * from './attribute';
export * from './billing';
export * from './card';
export * from './cart';
export * from './category';
export * from './content';
export * from './coupon';
export * from './currency';
export * from './discount';
export * from './giftcard';
export * from './invoice';
export * from './locale';
export * from './order';
export * from './payment';
export * from './product';
export * from './promotion';
export * from './purchase_link';
export * from './refund';
export * from './settings';
export * from './shipment_rating';
export * from './subscription';

export as namespace swell;

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

export interface InitOptions {
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
}

export interface ResultsResponse<T> {
  count: number;
  page: number;
  pages?: {
    [index: number]: {
      start: number;
      end: number;
    };
  };
  page_count?: number;
  pageCount?: number;
  results: T[];
}

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

export function init(
  storeId: string,
  publicKey: string,
  options?: InitOptions,
): void;

export namespace account {
  export function create(input: Account): Promise<Account>;

  export function login(
    user: string,
    password: string | PasswordTokenInput,
  ): Promise<Account | null>;

  export function logout(): Promise<unknown>;
  export function recover(input: object): Promise<Account>;
  export function update(input: Account): Promise<Account>;
  export function get(query?: object): Promise<Account | null>;

  export function listAddresses(
    input?: object,
  ): Promise<ResultsResponse<Address>>;

  /** @deprecated use `listAddresses` instead */
  export function getAddresses(
    input?: object,
  ): Promise<ResultsResponse<Address>>;

  export function createAddress(input: Address): Promise<Address>;
  export function updateAddress(id: string, input: Address): Promise<Address>;
  export function deleteAddress(id: string): Promise<Address>;

  export function listCards(query?: object): Promise<ResultsResponse<Card>>;
  /** @deprecated use `listCards` instead */
  export function getCards(query?: object): Promise<ResultsResponse<Card>>;
  export function createCard(input: Card): Promise<Card>;
  export function updateCard(id: string, input: Card): Promise<Card>;
  export function deleteCard(id: string): Promise<Card>;

  export function listOrders(query?: object): Promise<ResultsResponse<Order>>;
  /** @deprecated use `listOrders` instead */
  export function getOrders(query?: object): Promise<ResultsResponse<Order>>;
  export function getOrder(id: string): Promise<Order | null>;
}

export namespace attributes {
  export function get(id: string, query?: object): Promise<Attribute | null>;
  export function list(query?: object): Promise<ResultsResponse<Attribute>>;
}

export namespace card {
  export function createToken(input: InputCreateToken): Promise<TokenResponse>;
  export function validateCVC(code: string): boolean;
  export function validateExpiry(month: string, year: string): boolean;
  export function validateNumber(cardNumber: string): boolean;
}

export namespace cart {
  export function get(): Promise<Cart | null>;
  export function update(input: object): Promise<Cart>;
  export function recover(input: string): Promise<Cart>;

  export function getSettings(): Promise<Settings>;
  export function getShippingRates(): Promise<ShipmentRating>;

  export function addItem(input: CartItem): Promise<Cart>;
  export function setItems(input: CartItem[]): Promise<Cart>;
  export function updateItem(id: string, input: CartItem): Promise<Cart>;
  export function removeItem(id: string): Promise<Cart>;

  export function applyCoupon(code: string): Promise<Cart>;
  export function removeCoupon(): Promise<Cart>;

  export function applyGiftcard(code: string): Promise<Cart>;
  export function removeGiftcard(id: string): Promise<Cart>;

  export function submitOrder(): Promise<Order>;
  export function getOrder(checkoutId?: string): Promise<Order | null>;
}

export namespace categories {
  export function get(id: string, query?: object): Promise<Category | null>;
  export function list(query?: object): Promise<ResultsResponse<Category>>;
}

export namespace content {
  export function get(
    type: string,
    id: string,
    query?: Query,
  ): Promise<Content | ResultsResponse<Content>>;

  export function list(
    type: string,
    query?: Query,
  ): Promise<ResultsResponse<Content>>;
}

export namespace currency {
  export function format(amount: number, format: FormatInput): string;
  export function set(code?: string): EnabledCurrency;
  export function get(): EnabledCurrency;
  export function list(): EnabledCurrency[] | Promise<EnabledCurrency[]>;
  export function select(currency: string): Promise<SelectCurrencyReturn>;
  export function selected(): string;
}

export namespace locale {
  export function get(): Locale;
  export function set(code: string): Locale;
  export function list(): Locale[] | Promise<Locale[]>;
  export function select(locale: string): Promise<{ locale: string }>;
  export function selected(): string;
}

export namespace payment {
  export function get(id: string): Promise<Payment>;
  export function methods(): Promise<object>;

  export function createElements(input: {
    card?: InputPaymentElementCard;
    ideal?: InputPaymentElementIdeal;
    paypal?: InputPaymentElementPaypal;
    google?: InputPaymentElementGoogle;
    apple?: InputPaymentElementApple;
  }): Promise<void>;

  export function tokenize(input?: {
    card?: object;
    ideal?: object;
    klarna?: object;
    bancontact?: object;
    paysafecard?: object;
    amazon?: object;
  }): Promise<void>;

  export function handleRedirect(input?: {
    card?: InputPaymentRedirect;
    paysafecard?: InputPaymentRedirect;
    klarna?: InputPaymentRedirect;
  }): Promise<void>;

  export function authenticate(id: string): Promise<object>;
  export function resetAsyncPayment(id: string): Promise<object>;

  export function createIntent(input: {
    gateway: string;
    intent: object;
  }): Promise<object>;

  export function updateIntent(input: {
    gateway: string;
    intent: object;
  }): Promise<object>;

  export function authorizeGateway(input: {
    gateway: string;
    params?: object;
  }): Promise<object>;
}

export interface ProductQuery extends Query {
  category?: string;
  categories?: string[];
  $filters?: unknown;
}

export namespace products {
  export function categories(products: FlexibleProductInput): Category[];

  export function filters(
    products: FlexibleProductInput,
    options?: object,
  ): object[];

  export function filterableAttributeFilters(
    products: Product[],
    options?: object,
  ): Promise<object[]>;

  export function get(id: string, query?: ProductQuery): Promise<Product>;
  export function list(query?: ProductQuery): Promise<ResultsResponse<Product>>;
  export function priceRange(product: FlexibleProductInput): PriceRange;

  export function attributes(products: FlexibleProductInput): Attribute[];

  export function variation(
    product: Product,
    options: object,
    purchaseOption?: object,
  ): Product;
}

export namespace settings {
  export function get(
    id?: string,
    defaultValue?: string | number | Settings,
  ): Settings | Promise<Settings>;

  export function refresh(): Promise<Settings>;
  export function getCurrentLocale(): string;
  export function getStoreLocale(): string;
  export function getStoreLocales(): Locale[];
  export function load(): Promise<void>;

  export function menus(
    id?: string,
    defaultValue?: unknown,
  ): Settings | Promise<Settings>;

  export function payments(
    id?: string,
    defaultValue?: string | number | Settings,
  ): Settings | Promise<Settings>;

  export function subscriptions(
    id?: string,
    defaultValue?: string | number | Settings,
  ): Settings | Promise<Settings>;

  export function session(
    id?: string,
    defaultValue?: string | number | Settings,
  ): Settings | Promise<Settings>;
}

export namespace subscriptions {
  export function create(input: object): Promise<Subscription>;
  export function update(id: string, input: object): Promise<Subscription>;
  export function list(query?: object): Promise<ResultsResponse<Subscription>>;
  export function get(id: string, query?: object): Promise<Subscription | null>;

  export function addItem(id: string, input: object): Promise<Subscription>;

  export function updateItem(
    id: string,
    itemId: string,
    input: object,
  ): Promise<Subscription>;

  export function removeItem(id: string, itemId: string): Promise<unknown>;
}

export namespace invoices {
  export function get(id: string, query?: object): Promise<Invoice | null>;
  export function list(query?: object): Promise<ResultsResponse<Invoice>>;
}

export namespace session {
  export function get(): Promise<Record<string, unknown>>;
  export function getCookie(): string;
  export function setCookie(): string;
}

export namespace functions {
  export function request<T>(
    method: string,
    appId: string,
    functionName: string,
    data?: unknown,
    options?: unknown,
  ): Promise<T>;

  export function get(
    appId: string,
    functionName: string,
    data?: unknown,
    options?: unknown,
  ): Promise<object | null>;

  export function put(
    appId: string,
    functionName: string,
    data?: unknown,
    options?: unknown,
  ): Promise<object>;

  export function post(
    appId: string,
    functionName: string,
    data?: unknown,
    options?: unknown,
  ): Promise<object>;
}

// Backward compatible functions

export function auth(
  storeId: string,
  publicKey: string,
  options?: InitOptions,
): void;

export function get<T>(url: string, query?: Query): Promise<T>;

export function put<T>(url: string, query?: Query): Promise<T>;

export function post<T>(url: string, query?: Query): Promise<T>;
