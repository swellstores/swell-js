import type { ResultsResponse, ResultsResponseCamel } from '../index';
import type { MakeCase } from '../utils';

import type {
  ContentObject,
  Product,
  Variant,
  Price,
  Upsell,
  ProductOption,
  OptionValue,
  Bundle,
  CrossSell,
  PurchaseOptions,
  StandardPurchaseOption,
  SubscriptionPlan,
  SubscriptionPurchaseOption,
  SubscriptionInterval,
} from './snake';

import type {
  ProductCamel,
  VariantCamel,
  PriceCamel,
  UpsellCamel,
  ProductOptionCamel,
  OptionValueCamel,
  BundleCamel,
  CrossSellCamel,
  PurchaseOptionsCamel,
  StandardPurchaseOptionCamel,
  SubscriptionPlanCamel,
  SubscriptionPurchaseOptionCamel,
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

export type ProductCase = MakeCase<Product, ProductCamel>;

export type {
  ContentObject,
  Product,
  Variant,
  Price,
  Upsell,
  ProductOption,
  OptionValue,
  Bundle,
  CrossSell,
  PurchaseOptions,
  StandardPurchaseOption,
  SubscriptionPlan,
  SubscriptionPurchaseOption,
  SubscriptionInterval,
  ProductCamel,
  VariantCamel,
  PriceCamel,
  UpsellCamel,
  ProductOptionCamel,
  OptionValueCamel,
  BundleCamel,
  CrossSellCamel,
  PurchaseOptionsCamel,
  StandardPurchaseOptionCamel,
  SubscriptionPlanCamel,
  SubscriptionPurchaseOptionCamel,
};
