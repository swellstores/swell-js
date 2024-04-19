import { loadScript, vaultRequest, setOptions } from './index';

describe('utils/index', () => {
  describe('#loadScript', () => {
    beforeEach(() => {
      // Mock document
      global.headScripts = [];
      global.document = {
        head: {
          appendChild: (script) => global.headScripts.push(script),
        },
        createElement: (_tag) => {
          const script = {
            addEventListener(eventName, handler) {
              if (eventName === 'load') {
                setTimeout(handler, 100);
              }
            },
            setAttribute(key, value) {
              script[key] = value;
            },
          };
          return script;
        },
      };
    });

    it('should load script without attributes', async () => {
      await loadScript(
        'paypal-sdk',
        'https://www.paypal.com/sdk/js?currency=USD&client-id=clientId&merchant-id=merchantId&intent=authorize&commit=false',
      );
      const script = global.headScripts.find(
        (script) => script.id === 'paypal-sdk',
      );
      expect(script).toBeDefined();
      expect(script.id).toEqual('paypal-sdk');
      expect(script.src).toEqual(
        'https://www.paypal.com/sdk/js?currency=USD&client-id=clientId&merchant-id=merchantId&intent=authorize&commit=false',
      );
    });

    it('should load script with attributes', async () => {
      await loadScript(
        'paypal-sdk',
        'https://www.paypal.com/sdk/js?currency=USD&client-id=clientId&merchant-id=merchantId&intent=authorize&commit=false',
        {
          'data-partner-attribution-id': 'SwellCommerce_SP',
        },
      );
      const script = global.headScripts.find(
        (script) => script.id === 'paypal-sdk',
      );
      expect(script).toBeDefined();
      expect(script.id).toEqual('paypal-sdk');
      expect(script.src).toEqual(
        'https://www.paypal.com/sdk/js?currency=USD&client-id=clientId&merchant-id=merchantId&intent=authorize&commit=false',
      );
      expect(script).toHaveProperty(
        'data-partner-attribution-id',
        'SwellCommerce_SP',
      );
    });
  });

  describe('#vaultRequest', () => {
    let vaultUrl;
    let timeout;
    let key;

    beforeEach(() => {
      vaultUrl = 'https://vault.schema.io';
      timeout = 10000;
      key = 'pk_test';

      setOptions({ vaultUrl, timeout, key });

      fetch.mockResponse(
        JSON.stringify({
          $data: { test: 'test-field' },
          $status: 200,
        }),
      );
    });

    it('should send vault request', async () => {
      const result = await vaultRequest('post', '/intent', {
        gateway: 'stripe',
        intent: { amount: 100, payment_method: 'pm_test' },
      });

      expect(result).toEqual({ test: 'test-field' });
      expect(fetch).toHaveBeenCalledWith(
        'https://vault.schema.io/intent?%24jsonp%5Bmethod%5D=post&%24jsonp%5Bcallback%5D=none&%24data%5Bgateway%5D=stripe&%24data%5Bintent%5D%5Bamount%5D=100&%24data%5Bintent%5D%5Bpayment_method%5D=pm_test&%24key=pk_test',
        expect.objectContaining({
          signal: expect.any(Object),
        }),
      );
    });

    it('should throw an error when the response is empty', async () => {
      fetch.mockResponse(JSON.stringify(''));

      await expect(() =>
        vaultRequest('post', '/intent', {
          gateway: 'stripe',
          intent: { amount: 100, payment_method: 'pm_test' },
        }),
      ).rejects.toThrow('A connection error occurred while making the request');
    });

    it('should throw an error when the response status is >= 300', async () => {
      fetch.mockResponse(
        JSON.stringify({
          $status: 400,
        }),
      );

      await expect(() =>
        vaultRequest('post', '/intent', {
          gateway: 'stripe',
          intent: { amount: 100, payment_method: 'pm_test' },
        }),
      ).rejects.toThrow('A connection error occurred while making the request');
    });

    it('should throw an error when the response contains $error', async () => {
      fetch.mockResponse(
        JSON.stringify({
          $status: 200,
          $error: 'Test Error',
        }),
      );

      await expect(() =>
        vaultRequest('post', '/intent', {
          gateway: 'stripe',
          intent: { amount: 100, payment_method: 'pm_test' },
        }),
      ).rejects.toThrow('Test Error');
    });
  });
});
