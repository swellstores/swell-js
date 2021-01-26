import products from './products';

const mockRequest = jest.fn();
const mockProductWithOptions = {
  price: 10,
  stock_status: 'in_stock',
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

describe('products', () => {
  let methods;
  beforeEach(() => {
    mockRequest.mockReset();
    methods = products(mockRequest, {});
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
  });
});
