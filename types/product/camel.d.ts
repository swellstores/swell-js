import { SnakeToCamelCase } from '..';
import {
  ProductSnake,
  VariantSnake,
  ImageSnake,
  PriceSnake,
  UpsellSnake,
  ProductOptionSnake,
  BundleSnake,
  CrossSellSnake,
} from './snake';

export type ProductCamel = {
  [K in keyof ProductSnake as SnakeToCamelCase<K>]: ProductSnake[K];
};

export type VariantCamel = {
  [K in keyof VariantSnake as SnakeToCamelCase<K>]: VariantSnake[K];
};

export type ImageCamel = {
  [K in keyof ImageSnake as SnakeToCamelCase<K>]: ImageSnake[K];
};

export type PriceCamel = {
  [K in keyof PriceSnake as SnakeToCamelCase<K>]: PriceSnake[K];
};

export type UpsellCamel = {
  [K in keyof UpsellSnake as SnakeToCamelCase<K>]: UpsellSnake[K];
};

export type ProductOptionCamel = {
  [K in keyof ProductOptionSnake as SnakeToCamelCase<K>]: ProductOptionSnake[K];
};

export type BundleCamel = {
  [K in keyof BundleSnake as SnakeToCamelCase<K>]: BundleSnake[K];
};

export type CrossSellCamel = {
  [K in keyof CrossSellSnake as SnakeToCamelCase<K>]: CrossSellSnake[K];
};
