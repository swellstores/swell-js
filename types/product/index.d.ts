import { ResultsResponse } from '../index';

import {
  ProductSnake,
  VariantSnake,
  ImageSnake,
  PriceSnake,
  UpsellSnake,
  ProductOptionSnake,
  OptionValueSnake,
  BundleSnake,
  CrossSellSnake,
} from './snake';

import {
  ProductCamel,
  VariantCamel,
  ImageCamel,
  PriceCamel,
  UpsellCamel,
  ProductOptionCamel,
  OptionValueCamel,
  BundleCamel,
  CrossSellCamel,
} from './camel';

export interface Product extends ProductSnake, ProductCamel {}
export interface Variant extends VariantSnake, VariantCamel {}
export interface Image extends ImageSnake, ImageCamel {}
export interface Price extends PriceSnake, PriceCamel {}
export interface Upsell extends UpsellSnake, UpsellCamel {}
export interface Bundle extends BundleSnake, BundleCamel {}
export interface CrossSell extends CrossSellSnake, CrossSellCamel {}
export interface OptionValue extends OptionValueSnake, OptionValueCamel {}
export interface ProductOption extends ProductOptionSnake, ProductOptionCamel {}

export interface PriceRange {
  interval: number;
  max: number;
  min: number;
}

export type FlexibleProductInput = Array<Product> | ResultsResponse<Product>;

export interface PurchaseOptions {
  standard?: object;
  subscription?: object;
  trial?: object;
}
