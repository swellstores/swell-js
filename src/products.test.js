const products = require('./products');

const mockRequest = jest.fn();
const mockProductWithOptions = {
  stock_status: 'in_stock',
  price: 10,
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
        option_value_ids: ['1', '2'],
        stock_status: 'out_of_stock',
        price: 15,
      },
    ],
  },
};

describe('products', () => {
  let methods;
  beforeEach(() => {
    mockRequest.mockReset();
    methods = products.methods(mockRequest);
  });

  describe('methods', () => {
    it('should return methods list, get, stockWithOptions', () => {
      expect(methods.list).toBeDefined();
      expect(methods.get).toBeDefined();
      expect(methods.stockWithOptions).toBeDefined();
    });
  });

  describe('stockWithOptions', () => {
    it('should return product stock status by default', () => {
      const product = { stock_status: 'out_of_stock' };

      expect(methods.stockWithOptions(product)).toEqual('out_of_stock');
    });

    it('should return product stock status with empty options', () => {
      const product = { stock_status: 'out_of_stock' };

      expect(methods.stockWithOptions(product, [])).toEqual('out_of_stock');
    });

    it('should return variant stock status with variant options', () => {
      const options = [{ id: 'x', value: '1' }, { id: 'y', value: '2' }];

      expect(methods.stockWithOptions(mockProductWithOptions, options)).toEqual('out_of_stock');
    });

    it('should return variant stock status with variant options using names', () => {
      const options = [{ id: 'size', value: 'large' }, { id: 'color', value: 'red' }];

      expect(methods.stockWithOptions(mockProductWithOptions, options)).toEqual('out_of_stock');
    });
  });

  describe('variantWithOptions', () => {
    it('should return null by default', () => {
      expect(methods.variantWithOptions(mockProductWithOptions)).toEqual(null);
    });

    it('should return variant with some options', () => {
      const options = [{ id: 'x', value: '1' }, { id: 'y', value: '2' }];

      expect(methods.variantWithOptions(mockProductWithOptions, options)).toEqual(
        mockProductWithOptions.variants.results[0],
      );
    });
  });

  describe('priceWithOptions', () => {
    it('should return product price by default', () => {
      expect(methods.priceWithOptions(mockProductWithOptions)).toEqual(10);
    });

    it('should return variant price with some options', () => {
      const options = [{ id: 'x', value: '1' }, { id: 'y', value: '2' }];

      expect(methods.priceWithOptions(mockProductWithOptions, options)).toEqual(15);
    });

    it('should return product + option price with addon option', () => {
      const options = [{ id: 'z', value: 'stuff' }];

      expect(methods.priceWithOptions(mockProductWithOptions, options)).toEqual(13);
    });

    it('should return variant + option price with addon option', () => {
      const options = [{ id: 'x', value: '1' }, { id: 'y', value: '2' }, { id: 'z', value: 'stuff' }];

      expect(methods.priceWithOptions(mockProductWithOptions, options)).toEqual(18);
    });
  });
});
