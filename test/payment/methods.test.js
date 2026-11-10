import {
  availableMethods,
  defaultMethod,
  needsPayment,
} from '../../src/payment/methods';

const stripeStore = [
  { id: 'card', gateway: 'stripe' },
  { id: 'ideal', gateway: 'stripe' },
  { id: 'klarna', gateway: 'stripe' },
  { id: 'bancontact', gateway: 'stripe' },
  { id: 'paypal', gateway: 'paypal' },
  { id: 'google', gateway: 'stripe' },
  { id: 'paysafecard', gateway: 'paysafecard' },
  { id: 'bank', manual: true, description: 'Wire' },
  { id: 'my-pay', extension_app_id: 'app_1' },
  { id: 'twint', gateway: 'saferpay' },
];

describe('payment/methods', () => {
  describe('availableMethods', () => {
    it('should keep the methods the gateways support and hide unpaid wallets', () => {
      const ids = availableMethods({ capture_total: 10 }, stripeStore).map(
        (m) => m.id,
      );

      expect(ids).toEqual([
        'card',
        'ideal',
        'klarna',
        'bancontact',
        'paysafecard',
        'bank',
        'my-pay',
      ]);
    });

    it('should show a wallet that already paid', () => {
      const ids = availableMethods(
        { capture_total: 10, billing: { paypal: { payer_id: 'p' } } },
        stripeStore,
      ).map((m) => m.id);

      expect(ids).toContain('paypal');
      expect(ids).not.toContain('google');
    });

    it('should show wallets when nothing is due', () => {
      const ids = availableMethods({ capture_total: 0 }, stripeStore).map(
        (m) => m.id,
      );

      expect(ids).toContain('paypal');
    });

    it('should keep twint on a Saferpay card gateway and klarna direct', () => {
      const ids = availableMethods(
        { capture_total: 10 },
        {
          card: { gateway: 'saferpay' },
          twint: { gateway: 'saferpay' },
          klarna: { gateway: 'klarna' },
          ideal: { gateway: 'stripe' },
        },
      ).map((m) => m.id);

      expect(ids).toEqual(['card', 'twint', 'klarna']);
    });
  });

  describe('needsPayment', () => {
    it('should be false only for an authorized PayPal payment', () => {
      expect(needsPayment({})).toBe(true);
      expect(needsPayment({ billing: { method: 'card' } })).toBe(true);
      expect(
        needsPayment({
          billing: {
            method: 'paypal',
            paypal: { payment_id: 'pay', payer_id: 'payer' },
          },
        }),
      ).toBe(false);
    });
  });

  describe('defaultMethod', () => {
    it('should prefer the billing method, then the first available', () => {
      expect(
        defaultMethod(
          { capture_total: 10, billing: { method: 'bank' } },
          stripeStore,
        ),
      ).toBe('bank');
      expect(defaultMethod({ capture_total: 10 }, stripeStore)).toBe('card');
    });

    it('should be null when nothing is collected', () => {
      expect(defaultMethod({ capture_total: 0 }, stripeStore)).toBeNull();
      expect(
        defaultMethod(
          { capture_total: 0, subscription_delivery: true },
          stripeStore,
        ),
      ).toBe('card');
    });
  });
});
