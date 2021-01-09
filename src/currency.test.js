const currency = require('./currency');

const mockRequest = jest.fn();
const mockCurrencyResult = {
  "id": "2020-12-29",
  "base": "AUD",
  "rates": {
    "AED": 2.79503,
    "AFN": 58.75155,
    "ALL": 76.70186,
    "AMD": 397.23602,
    "ANG": 1.36646,
    "AOA": 498.37888,
    "ARS": 63.90683,
    "AWG": 1.36646,
    "AZN": 1.28571,
    "BAM": 1.21118,
    "BBD": 1.53416,
    "BDT": 64.48447,
    "BGN": 1.21739,
    "BHD": 0.28571,
    "BIF": 1480.03727,
    "BMD": 0.75776,
    "BND": 1.01242,
    "BOB": 5.23602,
    "BRL": 3.95031,
    "USD": 0.75776,
  }
};

const mockClientResult = {
  //
};

describe('products', () => {
  let methods;
  beforeEach(() => {
    mockRequest.mockReset();
    methods = currency.methods(mockRequest, {});
  });

  describe('methods', () => {
    it('should return methods list, select, selected, format', () => {
      expect(methods.list).toBeDefined();
      expect(methods.select).toBeDefined();
      expect(methods.selected).toBeDefined();
      expect(methods.format).toBeDefined();
    });
  });

  describe('list', () => {
    it('should return list of enabled currencies', () => {
      const currencies = methods.list();

      expect(variation).toEqual(mockProductWithOptions);
    });
  });
});
