"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('./utils'),
    get = _require.get,
    reduce = _require.reduce,
    find = _require.find,
    uniq = _require.uniq,
    defaultMethods = _require.defaultMethods,
    toSnake = _require.toSnake,
    toCamel = _require.toCamel,
    isEqual = _require.isEqual,
    snakeCase = _require.snakeCase;

var cache = require('./cache');

var attributesApi = require('./attributes');

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
    filters: getFilters,
    filterableAttributeFilters: function filterableAttributeFilters(products, options) {
      return getFilterableAttributeFilters(request, products, options);
    }
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

      return _objectSpread(_objectSpread({}, acc), {}, (_objectSpread2 = {}, (0, _defineProperty2["default"])(_objectSpread2, val.id, _objectSpread(_objectSpread({}, val), {}, {
        id: val.id
      })), (0, _defineProperty2["default"])(_objectSpread2, val.name, _objectSpread(_objectSpread({}, val), {}, {
        id: val.id
      })), _objectSpread2));
    }, {});
    return _objectSpread(_objectSpread({}, acc), {}, (_objectSpread3 = {}, (0, _defineProperty2["default"])(_objectSpread3, op.id, _objectSpread(_objectSpread({}, op), {}, {
      values: values
    })), (0, _defineProperty2["default"])(_objectSpread3, op.name, _objectSpread(_objectSpread({}, op), {}, {
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

  var _iterator = _createForOfIteratorHelper(cleanOptions),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var option = _step.value;

      if (index[option.id] && index[option.id].values[option.value]) {
        optionValueIds.push(index[option.id].values[option.value].id);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return optionValueIds;
}

function findVariantWithOptionValueIds(product, ids) {
  if (ids.length > 0) {
    var variants = product.variants && product.variants.results;

    if (variants.length > 0) {
      var _iterator2 = _createForOfIteratorHelper(variants),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var variant = _step2.value;
          var variantObj = toSnake(variant);
          var matched = isEqual(variantObj.option_value_ids.sort(), ids.sort());

          if (matched) {
            return variant;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }

  return null;
}

function findVariantWithOptions(product, options) {
  var optionValueIds = getVariantOptionValueIds(product, options);
  return findVariantWithOptionValueIds(product, optionValueIds);
}

function calculateVariation(input, options, purchaseOption) {
  var product = OPTIONS.useCamelCase ? toSnake(input) : input;
  var purchaseOp = findPurchaseOption(product, purchaseOption);

  var variation = _objectSpread(_objectSpread({}, product), {}, {
    price: purchaseOp.price || 0,
    sale_price: purchaseOp.sale_price,
    orig_price: purchaseOp.orig_price,
    stock_status: product.stock_status
  });

  var optionPrice = 0;
  var variantOptionValueIds = [];
  var cleanOptions = cleanProductOptions(options);
  var index = getProductOptionIndex(product);

  var _iterator3 = _createForOfIteratorHelper(cleanOptions),
      _step3;

  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var option = _step3.value;

      if (index[option.id] && index[option.id].values[option.value]) {
        if (index[option.id].variant) {
          variantOptionValueIds.push(index[option.id].values[option.value].id);
        } else {
          optionPrice += index[option.id].values[option.value].price || 0;
        }
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }

  if (variantOptionValueIds.length > 0) {
    var variant = findVariantWithOptionValueIds(product, variantOptionValueIds);

    if (variant) {
      var variantPurchaseOp = purchaseOp;

      try {
        variantPurchaseOp = findPurchaseOption(variant, purchaseOption);
      } catch (err) {// noop
      }

      variation.variant_id = variant.id;
      variation.price = variantPurchaseOp.price || 0;
      variation.sale_price = variantPurchaseOp.sale_price || purchaseOp.sale_price;
      variation.orig_price = variantPurchaseOp.orig_price || purchaseOp.orig_price;
      variation.stock_status = variant.stock_status;
      variation.stock_level = variant.stock_level || 0;
      variation.images = (variant.images && variant.images.length ? variant.images : product.images) || [];
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

function findPurchaseOption(product, purchaseOption) {
  var plan = get(purchaseOption, 'plan_id', get(purchaseOption, 'plan'));
  var type = get(purchaseOption, 'type', typeof purchaseOption === 'string' ? purchaseOption : plan !== undefined ? 'subscription' : 'standard');
  var option = get(product, "purchase_options.".concat(type));

  if (!option && type !== 'standard') {
    throw new Error("Product purchase option '".concat(type, "' not found or not active"));
  }

  if (option) {
    if (option.plans) {
      if (plan !== undefined) {
        option = find(option.plans, {
          id: plan
        });

        if (!option) {
          throw new Error("Subscription purchase plan '".concat(plan, "' not found or not active"));
        }
      } else {
        option = option.plans[0];
      }
    }

    return _objectSpread(_objectSpread({}, option), {}, {
      price: typeof option.price === 'number' ? option.price : product.price,
      sale_price: typeof option.sale_price === 'number' ? option.sale_price : product.sale_price,
      orig_price: typeof option.orig_price === 'number' ? option.orig_price : product.orig_price
    });
  }

  return {
    type: 'standard',
    price: product.price,
    sale_price: product.sale_price,
    orig_price: product.orig_price
  };
}

function getFilterableAttributeFilters(_x, _x2, _x3) {
  return _getFilterableAttributeFilters.apply(this, arguments);
}

function _getFilterableAttributeFilters() {
  _getFilterableAttributeFilters = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, products, options) {
    var _yield$attributesApi$, filterableAttributes;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return attributesApi.methods(request, OPTIONS).list({
              filterable: true
            });

          case 2:
            _yield$attributesApi$ = _context.sent;
            filterableAttributes = _yield$attributesApi$.results;
            return _context.abrupt("return", getFilters(products, _objectSpread(_objectSpread({}, options), {}, {
              filterableAttributes: filterableAttributes
            })));

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getFilterableAttributeFilters.apply(this, arguments);
}

function getFilters(products) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var attributes = (options.attributes || options.attributes === undefined) && getAttributes(products);

  if (options.filterableAttributes) {
    attributes = attributes.filter(function (productAttr) {
      return options.filterableAttributes.find(function (filterableAttr) {
        return productAttr.id === filterableAttr.id;
      });
    });
  }

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
    var _iterator4 = _createForOfIteratorHelper(collection),
        _step4;

    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var product = _step4.value;

        if (product.categories) {
          var _iterator5 = _createForOfIteratorHelper(product.categories),
              _step5;

          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var category = _step5.value;
              if (!category) continue;
              var ex = find(categories, {
                id: category.id
              });

              if (!ex) {
                categories.push(category);
              }
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
        }
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
  }

  return categories;
}

function getAttributes(products) {
  var attributes = [];
  var collection = products && products.results || (products.id ? [products] : products);

  if (collection instanceof Array) {
    var _iterator6 = _createForOfIteratorHelper(collection),
        _step6;

    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        var product = _step6.value;

        if (product.attributes) {
          for (var id in product.attributes) {
            if (!product.attributes[id]) continue;
            var value = product.attributes[id].value;
            var attr = find(attributes, {
              id: snakeCase(id)
            });

            if (attr) {
              attr.values = uniq([].concat((0, _toConsumableArray2["default"])(attr.values), (0, _toConsumableArray2["default"])(value instanceof Array ? value : [value])));
            } else {
              attributes.push(_objectSpread(_objectSpread({}, product.attributes[id]), {}, {
                value: undefined,
                values: (0, _toConsumableArray2["default"])(value instanceof Array ? value : [value])
              }));
            }
          }
        }
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
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
    var _iterator7 = _createForOfIteratorHelper(collection),
        _step7;

    try {
      for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
        var product = _step7.value;

        if (max === undefined || product.price > max) {
          max = Math.ceil(product.price);
        }

        if (min === undefined || product.price < min) {
          min = Math.floor(product.price);
        }
      }
    } catch (err) {
      _iterator7.e(err);
    } finally {
      _iterator7.f();
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