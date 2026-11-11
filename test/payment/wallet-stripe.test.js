import { describePayment } from './utils';
import StripeGooglePayment from '../../src/payment/google/stripe';
import StripeApplePayment from '../../src/payment/apple/stripe';

const event = (billingName, payerName) => ({
  payerEmail: 'payer@example.com',
  payerName,
  paymentMethod: {
    id: 'pm_wallet',
    card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2030 },
    billing_details: {
      name: billingName,
      address: { line1: '1 Main St', city: 'Austin', country: 'US' },
    },
  },
  complete: jest.fn(),
});

describePayment('payment/wallets/stripe', (request, options, paymentMock) => {
  const methods = {
    card: { publishable_key: 'test_stripe_publishable_key' },
    google: {},
    apple: {},
  };

  describe.each([
    ['google', StripeGooglePayment],
    ['apple', StripeApplePayment],
  ])('%s #_onPaymentMethod', (_name, Wallet) => {
    beforeEach(() => paymentMock.updateCart.mockClear());

    it("fills the billing name with the payer's when the card's address has none", async () => {
      const payment = new Wallet(request, options, {}, methods);
      payment.onSuccess = jest.fn();

      await payment._onPaymentMethod(event(undefined, 'Pat Payer'));

      expect(paymentMock.updateCart).toHaveBeenCalledWith(
        expect.objectContaining({
          billing: expect.objectContaining({
            name: 'Pat Payer',
            city: 'Austin',
            method: 'card',
          }),
        }),
      );
    });

    it("keeps the card's own billing name", async () => {
      const payment = new Wallet(request, options, {}, methods);
      payment.onSuccess = jest.fn();

      await payment._onPaymentMethod(event('Card Holder', 'Pat Payer'));

      expect(paymentMock.updateCart.mock.calls[0][0].billing.name).toBe(
        'Card Holder',
      );
    });
  });
});
