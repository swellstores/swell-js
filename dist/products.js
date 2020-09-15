"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('./utils'),
    map = _require.map,
    reduce = _require.reduce,
    find = _require.find,
    uniq = _require.uniq,
    defaultMethods = _require.defaultMethods,
    toSnake = _require.toSnake,
    toCamel = _require.toCamel;

var cache = require('./cache');

var OPTIONS;

function methods(request, opt) {
  OPTIONS = opt;

  var _defaultMethods = defaultMethods(request, '/products', ['list', 'get']),
      _get = _defaultMethods.get,
      list = _defaultMethods.list;

  return {
    get: function get(id) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return cache.getFetch('products', id, function () {
        return _get.apply(void 0, [id].concat(args));
      });
    },
    list: list,
    variation: calculateVariation,
    categories: getCategories,
    attributes: getAttributes,
    priceRange: getPriceRange,
    filters: getFilters
  };
}

function getProductOptionIndex(product) {
  var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

  if (!product.options) {
    return {};
  }

  var productOptions = filter ? product.options.filter(filter) : product.options;
  return reduce(productOptions, function (acc, op) {
    var _objectSpread3;

    var values = reduce(op.values, function (acc, val) {
      var _objectSpread2;

      return _objectSpread({}, acc, (_objectSpread2 = {}, (0, _defineProperty2["default"])(_objectSpread2, val.id, _objectSpread({}, val, {
        id: val.id
      })), (0, _defineProperty2["default"])(_objectSpread2, val.name, _objectSpread({}, val, {
        id: val.id
      })), _objectSpread2));
    }, {});
    return _objectSpread({}, acc, (_objectSpread3 = {}, (0, _defineProperty2["default"])(_objectSpread3, op.id, _objectSpread({}, op, {
      values: values
    })), (0, _defineProperty2["default"])(_objectSpread3, op.name, _objectSpread({}, op, {
      values: values
    })), _objectSpread3));
  }, {});
}

function cleanProductOptions(options) {
  var result = options || [];

  if (options && (0, _typeof2["default"])(options) === 'object' && !(options instanceof Array)) {
    result = [];

    for (var key in options) {
      result.push({
        id: key,
        value: options[key]
      });
    }
  }

  if (result instanceof Array) {
    return result.map(function (op) {
      return {
        id: op.id || op.name,
        value: op.value
      };
    });
  }

  return result;
}

function getVariantOptionValueIds(product, options) {
  var cleanOptions = cleanProductOptions(options);
  var index = getProductOptionIndex(product, function (op) {
    return op.variant;
  });
  var optionValueIds = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = cleanOptions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var option = _step.value;

      if (index[option.id] && index[option.id].values[option.value]) {
        optionValueIds.push(index[option.id].values[option.value].id);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return optionValueIds;
}

function findVariantWithOptionValueIds(product, ids) {
  if (ids.length > 0) {
    var variants = product.variants && product.variants.results;

    if (variants.length > 0) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = variants[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var variant = _step2.value;
          var matched = true;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = ids[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var valueId = _step3.value;

              if (variant.option_value_ids && variant.option_value_ids.indexOf(valueId) === -1) {
                matched = false;
                break;
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                _iterator3["return"]();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          if (matched) {
            return variant;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }

  return null;
}

function findVariantWithOptions(product, options) {
  var optionValueIds = getVariantOptionValueIds(product, options);
  return findVariantWithOptionValueIds(product, optionValueIds);
}

function calculateVariation(input, options) {
  var product = OPTIONS.useCamelCase ? toSnake(input) : input;

  var variation = _objectSpread({}, product, {
    price: product.price || 0,
    sale_price: product.sale_price,
    orig_price: product.orig_price,
    stock_status: product.stock_status
  });

  var optionPrice = 0;
  var variantOptionValueIds = [];
  var cleanOptions = cleanProductOptions(options);
  var index = getProductOptionIndex(product);
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = cleanOptions[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var option = _step4.value;

      if (index[option.id] && index[option.id].values[option.value]) {
        if (index[option.id].variant) {
          variantOptionValueIds.push(index[option.id].values[option.value].id);
        } else {
          optionPrice += index[option.id].values[option.value].price || 0;
        }
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
        _iterator4["return"]();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  if (variantOptionValueIds.length > 0) {
    var variant = findVariantWithOptionValueIds(product, variantOptionValueIds);

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

function getFilters(products) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var attributes = (options.attributes || options.attributes === undefined) && getAttributes(products);
  var categories = (options.categories || options.categories === undefined) && getCategories(products);
  var priceRange = (options.price || options.price === undefined) && getPriceRange(products);
  var filters = [];

  if (priceRange) {
    filters.push({
      id: 'price',
      label: 'Price',
      type: 'range',
      options: [{
        value: priceRange.min,
        label: priceRange.min // TODO: formatting

      }, {
        value: priceRange.max,
        label: priceRange.max // TODO: formatting

      }],
      interval: priceRange.interval
    });
  }

  if (categories && categories.length > 0) {
    filters.push({
      id: 'category',
      label: 'Category',
      type: 'select',
      options: categories.map(function (category) {
        return {
          value: category.slug,
          label: category.name
        };
      })
    });
  }

  if (attributes && attributes.length > 0) {
    filters = [].concat((0, _toConsumableArray2["default"])(filters), (0, _toConsumableArray2["default"])(reduce(attributes, function (acc, attr) {
      return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])(attr.id !== 'category' && attr.id !== 'price' && attr.values instanceof Array && attr.values.length > 0 ? [{
        id: attr.id,
        label: attr.name,
        type: 'select',
        options: attr.values.map(function (value) {
          return {
            value: value,
            label: value
          };
        })
      }] : []));
    }, [])));
  }

  return filters;
}

function getCategories(products) {
  var categories = [];
  var collection = products && products.results || (products.id ? [products] : products);

  if (collection instanceof Array) {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = collection[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var product = _step5.value;

        if (product.categories) {
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = product.categories[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var category = _step6.value;
              if (!category) continue;
              var ex = find(categories, {
                id: category.id
              });

              if (!ex) {
                categories.push(category);
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
          _iterator5["return"]();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  }

  return categories;
}

function getAttributes(products) {
  var attributes = [];
  var collection = products && products.results || (products.id ? [products] : products);

  if (collection instanceof Array) {
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = collection[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var product = _step7.value;

        if (product.attributes) {
          for (var id in product.attributes) {
            if (!product.attributes[id]) continue;
            var value = product.attributes[id].value;
            var attr = find(attributes, {
              id: id
            });

            if (attr) {
              attr.values = uniq([].concat((0, _toConsumableArray2["default"])(attr.values), (0, _toConsumableArray2["default"])(value instanceof Array ? value : [value])));
            } else {
              attributes.push(_objectSpread({}, product.attributes[id], {
                value: undefined,
                values: (0, _toConsumableArray2["default"])(value instanceof Array ? value : [value])
              }));
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
          _iterator7["return"]();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }
  }

  return attributes;
}

function getPriceRange(products) {
  var min;
  var max;
  var interval;
  var collection = products && products.results || (products.id ? [products] : products);

  if (collection instanceof Array) {
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = collection[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var product = _step8.value;

        if (max === undefined || product.price > max) {
          max = Math.ceil(product.price);
        }

        if (min === undefined || product.price < min) {
          min = Math.floor(product.price);
        }
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
          _iterator8["return"]();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }
  }

  if (min === max) {
    return null;
  }

  interval = Math.ceil((max - min) / 10) || 1;

  if (interval > 1000) {
    interval = 1000;
  } else if (interval > 100) {
    interval = 100;
  } else if (interval > 10) {
    interval = 10;
  }

  if (max % interval > 0) {
    max = interval + max - max % interval;
  }

  if (min % interval > 0) {
    min = min - min % interval;
  }

  while ((max - min) / interval % 1 > 0) {
    max++;
  }

  return {
    min: min,
    max: max,
    interval: interval
  };
}

module.exports = {
  methods: methods,
  cleanProductOptions: cleanProductOptions,
  getProductOptionIndex: getProductOptionIndex,
  getVariantOptionValueIds: getVariantOptionValueIds,
  findVariantWithOptions: findVariantWithOptions,
  calculateVariation: calculateVariation
};