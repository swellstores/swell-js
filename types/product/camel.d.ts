import { ConvertSnakeToCamelCase } from '..';

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

export type ProductCamel = ConvertSnakeToCamelCase<ProductSnake>;
export type VariantCamel = ConvertSnakeToCamelCase<VariantSnake>;
export type ImageCamel = ConvertSnakeToCamelCase<ImageSnake>;
export type PriceCamel = ConvertSnakeToCamelCase<PriceSnake>;
export type PricesCamel = ConvertSnakeToCamelCase<PriceSnake>;
export type UpsellCamel = ConvertSnakeToCamelCase<UpsellSnake>;
export type ProductOptionCamel = ConvertSnakeToCamelCase<ProductOptionSnake>;
export type OptionValueCamel = ConvertSnakeToCamelCase<OptionValueSnake>;
export type BundleCamel = ConvertSnakeToCamelCase<BundleSnake>;
export type CrossSellCamel = ConvertSnakeToCamelCase<CrossSellSnake>;
