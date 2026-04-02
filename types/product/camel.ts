import type {
  ConvertSnakeToCamelCase,
  ResultsResponseCamel,
  ImageCamel,
} from '..';
import type { Replace } from '../utils';

import type { AttributeCamel } from '../attribute/camel';
import type {
  SubscriptionBillingScheduleCamel,
  SubscriptionOrderScheduleCamel,
} from '../subscription/camel';

import type {
  Product,
  Variant,
  Price,
  Upsell,
  ProductOption,
  OptionValue,
  Bundle,
  CrossSell,
  StandardPurchaseOption,
  SubscriptionPlan,
  SubscriptionPurchaseOption,
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
export type PriceCamel = ConvertSnakeToCamelCase<Price>;

export type SubscriptionPlanCamel = ConvertSnakeToCamelCase<
  Replace<
    SubscriptionPlan,
    {
      billing_schedule?: SubscriptionBillingScheduleCamel;
      order_schedule?: SubscriptionOrderScheduleCamel;
    }
  >
>;

export type StandardPurchaseOptionCamel = ConvertSnakeToCamelCase<
  Replace<
    StandardPurchaseOption,
    {
      prices?: PriceCamel[];
    }
  >
>;

export type SubscriptionPurchaseOptionCamel = ConvertSnakeToCamelCase<
  Replace<
    SubscriptionPurchaseOption,
    {
      plans?: SubscriptionPlanCamel[];
    }
  >
>;

export type PurchaseOptionsCamel = {
  standard?: StandardPurchaseOptionCamel;
  subscription?: SubscriptionPurchaseOptionCamel;
};

export type VariantCamel = ConvertSnakeToCamelCase<
  Replace<
    Variant,
    {
      attributes?: AttributeCamel[];
      images?: ImageCamel[];
      parent?: ProductCamel;
      prices?: PriceCamel[];
      purchase_options?: PurchaseOptionsCamel;
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
      purchase_options?: PurchaseOptionsCamel;
      up_sells?: UpsellCamel[];
      variants?: ResultsResponseCamel<VariantCamel>;
    }
  >
>;
