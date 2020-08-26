const { map, reduce, find, uniq, defaultMethods, toSnake, toCamel } = require('./utils');
const cache = require('./cache');

let OPTIONS;
let listMethod;

function methods(request, opt) {
  OPTIONS = opt;
  const { get, list } = defaultMethods(request, '/products', ['list', 'get']);
  listMethod = list;
  return {
    get: (id, ...args) => {
      return cache.getFetch('products', id, () => get(id, ...args));
    },

    list,

    listFiltered,

    variation: calculateVariation,

    categories: getCategories,

    attributes: getAttributes,

    priceRange: getPriceRange,

    filters: getFilters,
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

function cleanProductOptions(options) {
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
  const cleanOptions = cleanProductOptions(options);
  const index = getProductOptionIndex(product, (op) => op.variant);
  const optionValueIds = [];
  for (const option of cleanOptions) {
    if (index[option.id] && index[option.id].values[option.value]) {
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

function calculateVariation(input, options) {
  const product = OPTIONS.useCamelCase ? toSnake(input) : input;
  const variation = {
    ...product,
    price: product.price || 0,
    sale_price: product.sale_price,
    orig_price: product.orig_price,
    stock_status: product.stock_status,
  };
  let optionPrice = 0;
  const variantOptionValueIds = [];
  const cleanOptions = cleanProductOptions(options);
  const index = getProductOptionIndex(product);
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
      variation.price = variant.price || 0;
      variation.sale_price = variant.sale_price || product.sale_price;
      variation.orig_price = variant.orig_price || product.orig_price;
      variation.stock_status = variant.stock_status || product.stock_status;
    }
  }
  if (optionPrice > 0) {
    variation.price += optionPrice;
    if (variation.sale_price) {
      variation.sale_price += optionPrice;
    }
    if (variation.orig_price) {
      variation.orig_price += optionPrice;
    }
  }
  if (variation.sale_price === undefined) {
    delete variation.sale_price;
  }
  if (variation.orig_price === undefined) {
    delete variation.orig_price;
  }
  return OPTIONS.useCamelCase ? toCamel(variation) : variation;
}

function listFiltered(filters = [], query = {}) {
  const filterQuery = {
    ...(query || {}),
  };
  if (filters instanceof Array) {
    for (let filter of filters) {
      if (!filter) continue;

      switch (filter.id) {
        case 'category':
          const value = filter.value instanceof Array ? filter.value : [filter.value];
          filterQuery.categories = value.map((val) => `+${val}`);
          if (query && query.categories) {
            const ex =
              query.categories instanceof Array
                ? query.categories
                : String(query.categories).split(/[\s]*,[\s]*/);
            filterQuery.categories = [...ex, ...filterQuery.categories];
          }
          break;

        case 'price':
          filterQuery.price = {
            $gte: filter.value[0],
            $lte: filter.value[1],
          };
          break;

        default:
          // attributes
          filterQuery[`attributes.${filter.id}`] = { $in: filter.value };
      }
    }
  }
  return listMethod(filterQuery);
}

function getFilters(products, options = {}) {
  const attributes =
    (options.attributes || options.attributes === undefined) && getAttributes(products);
  const categories =
    (options.categories || options.categories === undefined) && getCategories(products);
  const priceRange = (options.price || options.price === undefined) && getPriceRange(products);

  let filters = [];

  if (priceRange) {
    filters.push({
      id: 'price',
      label: 'Price',
      type: 'range',
      options: [
        {
          value: priceRange.min,
          label: priceRange.min, // TODO: formatting
        },
        {
          value: priceRange.max,
          label: priceRange.max, // TODO: formatting
        },
      ],
      interval: priceRange.interval,
    });
  }

  if (categories) {
    filters.push({
      id: 'category',
      label: 'Category',
      type: 'select',
      options: categories.map((category) => ({
        value: category.slug,
        label: category.name,
      })),
    });
  }

  if (attributes) {
    filters = [
      ...filters,
      ...reduce(
        attributes,
        (acc, attr) => [
          ...acc,
          ...(attr.id !== 'category' &&
          attr.id !== 'price' &&
          attr.values instanceof Array &&
          attr.values.length > 0
            ? [
                {
                  id: attr.id,
                  label: attr.name,
                  type: 'select',
                  options: attr.values.map((value) => ({
                    value,
                    label: value,
                  })),
                },
              ]
            : []),
        ],
        [],
      ),
    ];
  }

  return filters;
}

function getCategories(products) {
  const categories = [];
  const collection = (products && products.results) || (products.id ? [products] : products);
  if (collection instanceof Array) {
    for (let product of collection) {
      if (product.categories) {
        for (let category of product.categories) {
          if (!category) continue;
          let ex = find(categories, { id: category.id });
          if (!ex) {
            categories.push(category);
          }
        }
      }
    }
  }
  return categories;
}

function getAttributes(products) {
  const attributes = [];
  const collection = (products && products.results) || (products.id ? [products] : products);
  if (collection instanceof Array) {
    for (let product of collection) {
      if (product.attributes) {
        for (let id in product.attributes) {
          if (!product.attributes[id]) continue;
          const value = product.attributes[id].value;
          let attr = find(attributes, { id });
          if (attr) {
            attr.values = uniq([...attr.values, ...(value instanceof Array ? value : [value])]);
          } else {
            attributes.push({
              ...product.attributes[id],
              value: undefined,
              values: [...(value instanceof Array ? value : [value])],
            });
          }
        }
      }
    }
  }
  return attributes;
}

function getPriceRange(products) {
  let min = 0;
  let max = 0;
  let interval = 0;
  const collection = (products && products.results) || (products.id ? [products] : products);
  if (collection instanceof Array) {
    for (let product of collection) {
      if (product.price > max) {
        max = product.price;
      }
      if (min === 0 || product.price < min) {
        min = product.price;
      }
    }
  }
  interval = Math.ceil((max - min) / 10) || 1;
  return {
    min,
    max: max || 100,
    interval: interval || 1,
  };
}

module.exports = {
  methods,
  cleanProductOptions,
  getProductOptionIndex,
  getVariantOptionValueIds,
  findVariantWithOptions,
  calculateVariation,
};
