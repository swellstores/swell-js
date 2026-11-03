import { loadScript, vaultRequest } from './index';

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
    const options = {
      vaultUrl: 'https://vault.schema.io',
      timeout: 10000,
      key: 'pk_test',
    };

    beforeEach(() => {
      fetch.mockResponse(
        JSON.stringify({
          $data: { test: 'test-field' },
          $status: 200,
        }),
      );
    });

    it('should send vault request', async () => {
      const result = await vaultRequest(
        'post',
        '/intent',
        {
          gateway: 'stripe',
          intent: { amount: 100, payment_method: 'pm_test' },
        },
        options,
      );

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
        vaultRequest(
          'post',
          '/intent',
          {
            gateway: 'stripe',
            intent: { amount: 100, payment_method: 'pm_test' },
          },
          options,
        ),
      ).rejects.toThrow('A connection error occurred while making the request');
    });

    it('should throw an error when the response status is >= 300', async () => {
      fetch.mockResponse(
        JSON.stringify({
          $status: 400,
        }),
      );

      await expect(() =>
        vaultRequest(
          'post',
          '/intent',
          {
            gateway: 'stripe',
            intent: { amount: 100, payment_method: 'pm_test' },
          },
          options,
        ),
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
        vaultRequest(
          'post',
          '/intent',
          {
            gateway: 'stripe',
            intent: { amount: 100, payment_method: 'pm_test' },
          },
          options,
        ),
      ).rejects.toThrow('Test Error');
    });

    it('attaches a captcha token to create-intent requests', async () => {
      const getCaptchaToken = jest.fn().mockResolvedValue('tok-123');

      await vaultRequest(
        'post',
        '/intent',
        { gateway: 'stripe' },
        { ...options, getCaptchaToken },
      );

      expect(getCaptchaToken).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('%24data%5Bcaptcha_token%5D=tok-123'),
        expect.anything(),
      );
    });

    it('attaches a captcha token regardless of method case and path form', async () => {
      const getCaptchaToken = jest.fn().mockResolvedValue('tok-123');

      for (const [method, url] of [
        ['POST', '/intent'],
        ['post', '/intent/'],
        ['post', 'intent?x=1'],
      ]) {
        await vaultRequest(
          method,
          url,
          { gateway: 'stripe' },
          { ...options, getCaptchaToken },
        );
      }

      expect(getCaptchaToken).toHaveBeenCalledTimes(3);
    });

    it('does not request a captcha token for non-create-intent requests', async () => {
      const getCaptchaToken = jest.fn().mockResolvedValue('tok-123');

      await vaultRequest(
        'put',
        '/intent',
        { gateway: 'stripe' },
        { ...options, getCaptchaToken },
      );
      await vaultRequest(
        'post',
        '/authorization',
        { gateway: 'stripe' },
        { ...options, getCaptchaToken },
      );
      await vaultRequest(
        'post',
        '/intent/pi_123',
        { gateway: 'stripe' },
        { ...options, getCaptchaToken },
      );

      expect(getCaptchaToken).not.toHaveBeenCalled();
    });

    it('aborts the request when the captcha provider rejects', async () => {
      const getCaptchaToken = jest
        .fn()
        .mockRejectedValue(new Error('Captcha failed'));

      await expect(() =>
        vaultRequest(
          'post',
          '/intent',
          { gateway: 'stripe' },
          { ...options, getCaptchaToken },
        ),
      ).rejects.toThrow('Captcha failed');

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
