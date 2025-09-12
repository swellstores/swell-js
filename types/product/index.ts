import type { ResultsResponse, ResultsResponseCamel } from '../index';
import type { MakeCase } from '../utils';

import type {
  Product,
  Variant,
  Image,
  Price,
  Upsell,
  ProductOption,
  OptionValue,
  Bundle,
  CrossSell,
} from './snake';

import type {
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

export interface PriceRange {
  interval: number;
  max: number;
  min: number;
}

export type FlexibleProductInput = Product[] | ResultsResponse<Product>;

export type FlexibleProductInputCamel =
  | ProductCamel[]
  | ResultsResponseCamel<ProductCamel>;

export type FlexibleProductInputCase = MakeCase<
  FlexibleProductInput,
  FlexibleProductInputCamel
>;

export interface PurchaseOptions {
  standard?: object;
  subscription?: object;
  trial?: object;
}

export type ProductCase = MakeCase<Product, ProductCamel>;

export type {
  Product,
  Variant,
  Image,
  Price,
  Upsell,
  ProductOption,
  OptionValue,
  Bundle,
  CrossSell,
  ProductCamel,
  VariantCamel,
  ImageCamel,
  PriceCamel,
  UpsellCamel,
  ProductOptionCamel,
  OptionValueCamel,
  BundleCamel,
  CrossSellCamel,
};
