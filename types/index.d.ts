// Type definitions for swell-js
// Project: https://github.com/swellstores/swell-js#readme
// Thanks to contributor Gus Fune <https://github.com/gusfune>
// Credit Stackoverflow user ford04 for SnakeToCamelCase function
// https://stackoverflow.com/questions/60269936/typescript-convert-generic-object-from-snake-to-camel-case
/// <reference path="./attribute/index.d.ts" />
/// <reference path="./account/index.d.ts" />
/// <reference path="./card/index.d.ts" />
/// <reference path="./category/index.d.ts" />
/// <reference path="./content/index.d.ts" />
/// <reference path="./currency/index.d.ts" />
/// <reference path="./locale/index.d.ts" />
/// <reference path="./order/index.d.ts" />
/// <reference path="./product/index.d.ts" />
/// <reference path="./settings/index.d.ts" />

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
  InputPaymentElementAmazon,
  InputPaymentRedirect,
  Payment,
} from './payment';
import { Settings } from './settings';
import { Subscription } from './subscription';
import { Invoice } from './invoice';
import { ShipmentRating } from './shipment_rating';

export * from './account';
export * from './attribute';
export * from './card';
export * from './cart';
export * from './category';
export * from './category';
export * from './content';
export * from './currency';
export * from './locale';
export * from './order';
export * from './payment';
export * from './product';
export * from './settings';
export * from './subscription';

export as namespace swell;

export type SnakeToCamelCase<S extends any> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export interface BaseModel {
  date_created?: string;
  date_updated?: string;
  id?: string;
}

export interface Query {
  limit?: number;
  page?: number;
  expand?: string[] | string;
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
  results: Array<T>;
}

export interface Tax {
  amount?: number;
  id?: string;
  name?: string;
  priority?: number;
  rate?: number;
}

export interface Discount {
  amount?: number;
  id?: string;
}

export function init(
  storeId: string,
  publicKey: string,
  options?: InitOptions,
): void;

export namespace account {
  function create(input: Account): Promise<Account>;
  function createAddress(input: Address): Promise<Address>;
  function createCard(input: Card): Promise<Card>;
  function deleteAddress(id: string): Promise<Address>;
  function deleteCard(id: string): Promise<Card>;
  function get(): Promise<Account>;
  function getAddresses(input: object): Promise<Address>;
  function getCards(input: object): Promise<Card[]>;
  function getOrder(id: string): Promise<Order>;
  function getOrders(): ResultsResponse<Promise<Order>>;
  function listAddresses(): Promise<Address[]>;
  function listCards(): Promise<Card[]>;
  function listOrders(input?: object): ResultsResponse<Promise<Order>>;
  function login(
    user: string,
    password: string | PasswordTokenInput,
  ): Promise<Account | null>;
  function logout(): Promise<unknown>;
  function recover(input: object): Promise<Account>;
  function update(input: Account): Promise<Account>;
  function updateAddress(id: string, input: Address): Promise<Address>;
}

export namespace attributes {
  function get(input: string): Promise<Attribute>;
  function list(input?: object): Promise<ResultsResponse<Attribute>>;
}

export namespace card {
  function createToken(input: InputCreateToken): Promise<TokenResponse>;
  function validateCVC(input: string): boolean;
  function validateExpiry(input: string): boolean;
  function validateNumber(input: string): boolean;
}

export namespace cart {
  function addItem(input: CartItem): Promise<Cart>;
  function applyCoupon(input: string): Promise<Cart>;
  function get(input?: string): Promise<Cart | null>;
  function getSettings(): Promise<Settings>;
  function getShippingRates(): Promise<ShipmentRating[]>;
  function recover(input: string): Promise<Cart>;
  function removeCoupon(input: string): Promise<Cart>;
  function removeItem(input: string): Promise<Cart>;
  function setItems(input: CartItem[]): Promise<Cart>;
  function submitOrder(): Promise<Order>;
  function updateItem(id: string, input: CartItem): Promise<Cart>;
  function update(input: object): Promise<Cart>;
}

export namespace categories {
  function get(input: string): Promise<Category>;
  function list(input?: object): Promise<ResultsResponse<Category>>;
}

export namespace content {
  function get(
    type: string,
    id: string,
    query?: object,
  ): Promise<Content> | Promise<ResultsResponse<Content>>;
  function list(
    type: string,
    query?: object,
  ): Promise<ResultsResponse<Content>>;
}

export namespace currency {
  function format(input: number, format: FormatInput): string;
  function list(): Promise<Array<EnabledCurrency>>;
  function select(input: string): Promise<SelectCurrencyReturn>;
  function selected(): Promise<string>;
}

export namespace locale {
  function get(): Promise<Locale>;
  function list(): Promise<Array<Locale>>;
  function selected(): Promise<string>;
  function select(locale: string): Promise<{ locale: string }>;
  function set(code: string): Promise<Locale>;
}

export namespace payment {
  function get(id: string): Promise<Payment>;
  function methods(): Promise<object>;
  function createElements(input: {
    card?: InputPaymentElementCard;
    ideal?: InputPaymentElementIdeal;
    paypal?: InputPaymentElementPaypal;
    google?: InputPaymentElementGoogle;
    apple?: InputPaymentElementApple;
    amazon?: InputPaymentElementAmazon;
  }): Promise<void>;
  function tokenize(input: {
    card?: object;
    ideal?: object;
    klarna?: object;
    bancontact?: object;
    paysafecard?: object;
    amazon?: object;
  }): Promise<unknown>;
  function handleRedirect(input: {
    card?: InputPaymentRedirect;
    paysafecard?: InputPaymentRedirect;
    klarna?: InputPaymentRedirect;
    amazon?: InputPaymentRedirect;
  }): Promise<unknown>;
  function authenticate(id: string): Promise<unknown>;
  function createIntent(input: {
    gateway: string;
    intent: object;
  }): Promise<unknown>;
  function updateIntent(input: {
    gateway: string;
    intent: object;
  }): Promise<unknown>;
  function authorizeGateway(input: {
    gateway: string;
    params?: object;
  }): Promise<unknown>;
}

export interface ProductQuery extends Query {
  category?: string;
  categories?: string[];
  $filters?: unknown;
  search?: string;
  where?: object;
}
export namespace products {
  function categories(
    products: FlexibleProductInput,
  ): Promise<ResultsResponse<Category>>;
  function filters(products: FlexibleProductInput): Promise<object[]>;
  function filterableAttributeFilters(
    products: Array<Product>,
    options?: object,
  ): Array<Attribute>;
  function get(id: string, input?: ProductQuery): Promise<Product>;
  function list(input?: ProductQuery): Promise<ResultsResponse<Product>>;
  function priceRange(product: FlexibleProductInput): PriceRange;
  function variation(product: Product, options: object): Promise<Product>;
}

export namespace settings {
  function get(
    id?: string,
    def?: string | number | Settings,
  ): Promise<Settings>;
  function getCurrentLocale(): Promise<string>;
  function getStoreLocale(): Promise<string>;
  function getStoreLocales(): Promise<Array<string>>;
  function load(): Promise<Settings> | null;
  function menus(input?: string): Promise<Settings>;
  function payments(
    id?: string,
    def?: string | number | Settings,
  ): Promise<Settings>;
  function subscriptions(
    id?: string,
    def?: string | number | Settings,
  ): Promise<Settings>;
  function session(
    id?: string,
    def?: string | number | Settings,
  ): Promise<Settings>;
}

export namespace subscriptions {
  function addItem(id: string, input: object): Promise<Subscription>;
  function create(input: object): Promise<Subscription>;
  function get(id: string): Promise<Subscription>;
  function list(): Promise<ResultsResponse<Subscription>>;
  function removeItem(id: string, itemId: string): Promise<unknown>;
  function update(id: string, input: object): Promise<Subscription>;
  function updateItem(
    id: string,
    itemId: string,
    input: any,
  ): Promise<Subscription>;
}

export namespace invoices {
  function get(id: string): Promise<Invoice>;
  function list(): Promise<ResultsResponse<Invoice>>;
}

// Backward compatible functions

export function auth(
  storeId: string,
  publicKey: string,
  options?: InitOptions,
): void;

export function get(url: string, query: object): Promise<unknown>;

export function put(url: string, query: object): Promise<unknown>;

export function post(url: string, query: object): Promise<unknown>;
