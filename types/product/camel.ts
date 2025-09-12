import type { ConvertSnakeToCamelCase, ResultsResponseCamel } from '..';
import type { Replace } from '../utils';

import type { AttributeCamel } from '../attribute/camel';

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

export type BundleCamel = ConvertSnakeToCamelCase<
  Replace<
    Bundle,
    {
      product?: ProductCamel;
      variant?: VariantCamel;
    }
  >
>;

export type CrossSellCamel = ConvertSnakeToCamelCase<
  Replace<
    CrossSell,
    {
      product?: ProductCamel;
    }
  >
>;

export type OptionValueCamel = ConvertSnakeToCamelCase<
  Replace<
    OptionValue,
    {
      image?: ImageCamel;
      images?: ImageCamel[];
    }
  >
>;

export type ProductOptionCamel = ConvertSnakeToCamelCase<
  Replace<
    ProductOption,
    {
      values?: OptionValueCamel[];
    }
  >
>;

export type UpsellCamel = ConvertSnakeToCamelCase<Upsell>;
export type ImageCamel = ConvertSnakeToCamelCase<Image>;
export type PriceCamel = ConvertSnakeToCamelCase<Price>;

export type VariantCamel = ConvertSnakeToCamelCase<
  Replace<
    Variant,
    {
      attributes?: AttributeCamel[];
      images?: ImageCamel[];
      parent?: ProductCamel;
      prices?: PriceCamel[];
    }
  >
>;

export type ProductCamel = ConvertSnakeToCamelCase<
  Replace<
    Product,
    {
      attributes?: Record<string, AttributeCamel>;
      bundle_items?: BundleCamel[];
      cross_sells?: CrossSellCamel[];
      images?: ImageCamel[];
      options?: ProductOptionCamel[];
      prices?: PriceCamel[];
      up_sells?: UpsellCamel[];
      variants?: ResultsResponseCamel<VariantCamel>;
    }
  >
>;
