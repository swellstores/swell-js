const products = require('./products');

const mockRequest = jest.fn();
const mockProductWithOptions = {
  price: 10,
  stock_status: 'in_stock',
  stock_level: 0,
  images: [],
  options: [
    {
      id: 'x',
      name: 'size',
      values: [{ id: '1', name: 'large' }],
      variant: true,
    },
    {
      id: 'y',
      name: 'color',
      values: [{ id: '2', name: 'red' }],
      variant: true,
    },
    {
      id: 'z',
      name: 'addon',
      values: [{ id: '3', name: 'stuff', price: 3 }],
    },
  ],
  variants: {
    results: [
      {
        price: 15,
        option_value_ids: ['1', '2'],
        stock_status: 'out_of_stock',
      },
    ],
  },
};

const mockProductsWithAttributes = [
  {
    name: 'Product One',
    attributes: {
      origin: {
        name: 'Origin',
        type: 'select',
        visible: true,
        filterable: true,
        id: 'origin',
        value: 'Honduras',
      },
    },
  },
  {
    name: 'Product Two',
    attributes: {
      spacedAttribute: {
        name: 'Spaced Attribute',
        type: 'text',
        visible: true,
        filterable: true,
        id: 'spaced_attribute',
        value: 'One',
      },
    },
  },
  {
    name: 'Product Three',
    attributes: {
      spacedAttribute: {
        name: 'Spaced Attribute',
        type: 'text',
        visible: true,
        filterable: true,
        id: 'spaced_attribute',
        value: 'Two',
      },
    },
  },
];

describe('products', () => {
  let methods;
  beforeEach(() => {
    mockRequest.mockReset();
    methods = products.methods(mockRequest, {});
  });

  describe('methods', () => {
    it('should return methods list, get, variation', () => {
      expect(methods.list).toBeDefined();
      expect(methods.get).toBeDefined();
      expect(methods.variation).toBeDefined();
    });
  });

  describe('variation', () => {
    it('should return product with default values', () => {
      const variation = methods.variation(mockProductWithOptions);

      expect(variation).toEqual(mockProductWithOptions);
    });

    it('should return product with variant values', () => {
      const options = [
        { id: 'x', value: '1' },
        { id: 'y', value: '2' },
      ];
      const variation = methods.variation(mockProductWithOptions, options);

      expect(variation).toEqual({
        ...mockProductWithOptions,
        price: 15,
        stock_status: 'out_of_stock',
      });
    });

    it('should return product + option price with addon option', () => {
      const options = [{ id: 'z', value: 'stuff' }];
      const variation = methods.variation(mockProductWithOptions, options);

      expect(variation).toEqual({
        ...mockProductWithOptions,
        price: 13,
        stock_status: 'in_stock',
      });
    });

    it('should return variant + option price with addon option', () => {
      const options = [
        { id: 'x', value: '1' },
        { id: 'y', value: '2' },
        { id: 'z', value: 'stuff' },
      ];
      const variation = methods.variation(mockProductWithOptions, options);

      expect(variation).toEqual({
        ...mockProductWithOptions,
        price: 18,
        stock_status: 'out_of_stock',
      });
    });

    describe('with pricing', () => {
      const mockProductWithPricing = {
        ...mockProductWithOptions,
        price: 5,
        sale_price: 5,
        orig_price: 10,
        variants: {
          results: [
            {
              ...mockProductWithOptions.variants.results[0],
              price: 9,
              sale_price: 9,
              orig_price: 15,
            },
          ],
        },
      };

      it('should return product with default values', () => {
        const variation = methods.variation(mockProductWithPricing);

        expect(variation).toEqual(mockProductWithPricing);
      });

      it('should return product with variant values', () => {
        const options = [
          { id: 'x', value: '1' },
          { id: 'y', value: '2' },
        ];
        const variation = methods.variation(mockProductWithPricing, options);

        expect(variation).toEqual({
          ...mockProductWithPricing,
          price: 9,
          sale_price: 9,
          orig_price: 15,
          stock_status: 'out_of_stock',
        });
      });

      it('should return product + option price with addon option', () => {
        const options = [{ id: 'z', value: 'stuff' }];
        const variation = methods.variation(mockProductWithPricing, options);

        expect(variation).toEqual({
          ...mockProductWithPricing,
          price: 8,
          sale_price: 8,
          orig_price: 13,
          stock_status: 'in_stock',
        });
      });

      it('should return variant + option price with addon option', () => {
        const options = [
          { id: 'x', value: '1' },
          { id: 'y', value: '2' },
          { id: 'z', value: 'stuff' },
        ];
        const variation = methods.variation(mockProductWithPricing, options);

        expect(variation).toEqual({
          ...mockProductWithPricing,
          price: 12,
          sale_price: 12,
          orig_price: 18,
          stock_status: 'out_of_stock',
        });
      });
    });

    describe('with purchase options', () => {
      const mockProductWithPurchaseOptions = {
        ...mockProductWithOptions,
        price: 5,
        sale_price: 5,
        orig_price: 10,
        variants: {
          results: [
            {
              ...mockProductWithOptions.variants.results[0],
              price: 9,
              sale_price: 9,
              orig_price: 15,
            },
          ],
        },
        purchase_options: {
          standard: {
            price: 9,
            sale_price: 8,
            orig_price: 10,
          },
          subscription: {
            plans: [
              {
                id: 111,
                price: 8,
                sale_price: 7,
                orig_price: 9,
              },
              {
                id: 222,
                price: 7,
                sale_price: 6,
                orig_price: 8,
              },
              {
                id: 'monthly',
                price: 6,
                sale_price: 5,
                orig_price: 7,
              },
            ],
          },
        },
      };

      it('should return pricing from first subscription plan', () => {
        const variation = methods.variation(mockProductWithPurchaseOptions, [], 'subscription');

        expect(variation).toEqual({
          ...mockProductWithPurchaseOptions,
          price: 8,
          sale_price: 7,
          orig_price: 9,
        });
      });

      it('should return pricing from a specific subscription plan', () => {
        const variation = methods.variation(mockProductWithPurchaseOptions, [], {
          type: 'subscription',
          plan: 222,
        });

        expect(variation).toEqual({
          ...mockProductWithPurchaseOptions,
          price: 7,
          sale_price: 6,
          orig_price: 8,
        });
      });

      it('should return pricing from a specific subscription plan with omited type', () => {
        const variation = methods.variation(mockProductWithPurchaseOptions, [], {
          plan: 'monthly',
        });

        expect(variation).toEqual({
          ...mockProductWithPurchaseOptions,
          price: 6,
          sale_price: 5,
          orig_price: 7,
        });
      });

      it('should return pricing from a specific subscription plan id', () => {
        const variation = methods.variation(mockProductWithPurchaseOptions, [], {
          type: 'subscription',
          plan_id: 222,
        });

        expect(variation).toEqual({
          ...mockProductWithPurchaseOptions,
          price: 7,
          sale_price: 6,
          orig_price: 8,
        });
      });

      it('should return pricing from standard purchase option', () => {
        const variation = methods.variation(mockProductWithPurchaseOptions, [], 'standard');

        expect(variation).toEqual({
          ...mockProductWithPurchaseOptions,
          price: 9,
          sale_price: 8,
          orig_price: 10,
        });
      });

      it('should return pricing from standard purchase option type', () => {
        const variation = methods.variation(mockProductWithPurchaseOptions, [], { type: 'standard' });

        expect(variation).toEqual({
          ...mockProductWithPurchaseOptions,
          price: 9,
          sale_price: 8,
          orig_price: 10,
        });
      });

      it('should throw an error if the plan is not found', () => {
        expect(() => {
          methods.variation(mockProductWithPurchaseOptions, [], {
            type: 'subscription',
            plan: 'xxx',
          });
        }).toThrowError(`Subscription purchase plan 'xxx' not found`);
      });

      it('should throw an error if the purchase option is not found', () => {
        expect(() => {
          methods.variation(mockProductWithPurchaseOptions, [], { type: 'what' });
        }).toThrowError(`Product purchase option 'what' not found`);
      });

      it('should return variant + option price with addon option', () => {
        const options = [
          { id: 'x', value: '1' },
          { id: 'y', value: '2' },
          { id: 'z', value: 'stuff' },
        ];
        const variation = methods.variation(mockProductWithPurchaseOptions, options, 'subscription');

        expect(variation).toEqual({
          ...mockProductWithPurchaseOptions,
          price: 11,
          sale_price: 10,
          orig_price: 12,
          stock_status: 'out_of_stock',
        });
      });
    });
  });

  describe('attributes', () => {
    it('should return unique key attributes', () => {
      const attributes = methods.attributes(mockProductsWithAttributes);
      expect(attributes).toEqual([
        {
          name: 'Origin',
          type: 'select',
          visible: true,
          filterable: true,
          id: 'origin',
          value: undefined,
          values: ['Honduras'],
        },
        {
          name: 'Spaced Attribute',
          type: 'text',
          visible: true,
          filterable: true,
          id: 'spaced_attribute',
          value: undefined,
          values: ['One', 'Two'],
        },
      ]);
    });
  });
});
