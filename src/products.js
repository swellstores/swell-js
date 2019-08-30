const { map, reduce, defaultMethods } = require('./utils');

function methods(request) {
  return {
    ...defaultMethods(request, '/products', ['list', 'get']),

    variantWithOptions: findVariantWithOptions,

    priceWithOptions: calculatePriceWithOptions,

    stockWithOptions(product, options) {
      if (options) {
        const stockVariant = findVariantWithOptions(product, options);
        if (stockVariant) {
          return stockVariant.stock_status;
        }
      }
      return product.stock_status;
    },
  };
}

function getProductOptionIndex(product, filter = undefined) {
  if (!product.options) {
    return {};
  }
  const productOptions = filter ? product.options.filter(filter) : product.options;
  return reduce(
    productOptions,
    (acc, op) => {
      const values = reduce(
        op.values,
        (acc, val) => ({
          ...acc,
          [val.id]: { ...val, id: val.id },
          [val.name]: { ...val, id: val.id },
        }),
        {},
      );
      return {
        ...acc,
        [op.id]: { ...op, values },
        [op.name]: { ...op, values },
      };
    },
    {},
  );
}

function cleanProductOptions(product, options) {
  let result = options || [];
  if (options && typeof options === 'object' && !(options instanceof Array)) {
    result = [];
    for (const key in options) {
      result.push({
        id: key,
        value: options[key],
      });
    }
  }
  if (result instanceof Array) {
    return result.map((op) => ({
      id: op.id || op.name,
      value: op.value,
    }));
  }
  return result;
}

function getVariantOptionValueIds(product, options) {
  const cleanOptions = cleanProductOptions(product, options);
  const index = getProductOptionIndex(product, (op) => op.variant);
  const optionValueIds = [];
  for (const option of cleanOptions) {
    if (
      index[option.id] &&
      index[option.id].values[option.value]
    ) {
      optionValueIds.push(index[option.id].values[option.value].id);
    }
  }
  return optionValueIds;
}

function findVariantWithOptionValueIds(product, ids) {
  if (ids.length > 0) {
    const variants = product.variants && product.variants.results;
    if (variants.length > 0) {
      for (const variant of variants) {
        let matched = true;
        for (const valueId of ids) {
          if (variant.option_value_ids && variant.option_value_ids.indexOf(valueId) === -1) {
            matched = false;
            break;
          }
        }
        if (matched) {
          return variant;
        }
      }
    }
  }
  return null;
}

function findVariantWithOptions(product, options) {
  const optionValueIds = getVariantOptionValueIds(product, options);
  return findVariantWithOptionValueIds(product, optionValueIds);
}

function calculatePriceWithOptions(product, options) {
  const cleanOptions = cleanProductOptions(product, options);
  const index = getProductOptionIndex(product);
  let basePrice = product.price || 0;
  let optionPrice = 0;
  const variantOptionValueIds = [];
  for (const option of cleanOptions) {
    if (index[option.id] && index[option.id].values[option.value]) {
      if (index[option.id].variant) {
        variantOptionValueIds.push(index[option.id].values[option.value].id);
      } else {
        optionPrice += index[option.id].values[option.value].price || 0;
      }
    }
  }
  if (variantOptionValueIds.length > 0) {
    const variant = findVariantWithOptionValueIds(product, variantOptionValueIds);
    if (variant) {
      basePrice = variant.price || 0;
    }
  }
  return basePrice + optionPrice;
}

module.exports = {
  methods,
  cleanProductOptions,
  getProductOptionIndex,
  getVariantOptionValueIds,
  findVariantWithOptions,
  calculatePriceWithOptions,
};
