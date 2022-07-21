import { shouldUsePayPalEmail } from './payment';
import api from './api';

describe('payment', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
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
});
