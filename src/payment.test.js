import { shouldUsePayPalEmail, loadScript } from './payment';
import api from './api';

describe('payment', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');

    // Mock document
    global.headScripts = [];
    global.document = {
      head: {
        appendChild: (script) => global.headScripts.push(script),
      },
      createElement: (tag) => {
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

  describe('shouldUsePayPalEmail', () => {
    it("should not use PayPal's email if the user is logged in", async () => {
      const guest = false;
      const usePayPalEmail = await shouldUsePayPalEmail(
        guest,
        api.request,
        api.options,
      );

      expect(usePayPalEmail).toBe(false);
    });

    it("should not use PayPal's email if the user has an email", async () => {
      fetch.mockResponseOnce(
        JSON.stringify({ account: { email: 'test@email.com' } }),
      );

      const guest = true;
      const usePayPalEmail = await shouldUsePayPalEmail(
        guest,
        api.request,
        api.options,
      );

      expect(usePayPalEmail).toBe(false);
    });

    it("should use PayPal's email if the user has no email", async () => {
      fetch.mockResponseOnce(JSON.stringify({}));

      const guest = true;
      const usePayPalEmail = await shouldUsePayPalEmail(
        guest,
        api.request,
        api.options,
      );

      expect(usePayPalEmail).toBe(true);
    });
  });

  describe('loadScript', () => {
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
});
