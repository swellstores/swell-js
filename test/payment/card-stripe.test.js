import { describePayment } from './utils';

import PaymentController from '../../src/payment';

describePayment('payment/card/stripe', (_request, options, _paymentMock) => {
  describe('#authenticate', () => {
    it('should reset async payment after authenticate', async () => {
      const request = jest.fn(async (method, url, id) => {
        switch (method) {
          case 'get': {
            const targetUrl = typeof id === 'string' ? `${url}/${id}` : url;

            switch (targetUrl) {
              case '/payments/test_payment_id':
                return {
                  id: 'test_payment_id',
                  method: 'card',
                  gateway: 'stripe',
                  transaction_id: 'test_transaction_id',
                  card: { token: 'pm_test' },
                };

              case '/settings/payments':
                return {
                  card: {},
                };

              default:
                return null;
            }
          }

          case 'put': {
            return null;
          }

          default:
            return null;
        }
      });

      options.api = {
        locale: {
          selected: () => 'en',
        },
      };

      window.Stripe = function () {
        return {
          async confirmCardPayment() {
            return { paymentIntent: { status: 'succeeded' } };
          },
        };
      };

      const payment = new PaymentController({ request }, options);

      const paymentId = 'test_payment_id';

      const result = await payment.authenticate(paymentId);

      expect(result).toEqual({ status: 'succeeded' });

      expect(request).toHaveBeenCalledWith('put', '/payments', paymentId, {
        $reset_async_payment: true,
      });
    });
  });
});

jest.mock('../../src/utils/stripe', () => ({
  ...jest.requireActual('../../src/utils/stripe'),
  createPaymentMethod: jest.fn(async () => ({ token: 'pm_test' })),
}));

describePayment(
  'payment/card/stripe tokenize',
  (request, options, paymentMock) => {
    it('should store the card without an intent when createIntent is false', async () => {
      const StripeCardPayment =
        require('../../src/payment/card/stripe').default;

      paymentMock.getCart.mockResolvedValueOnce({
        currency: 'USD',
        capture_total: 100,
      });
      global.window.Stripe = jest.fn(() => ({}));

      const payment = new StripeCardPayment(
        request,
        options,
        { createIntent: false },
        { card: { publishable_key: 'pk', mode: 'live' } },
      );
      payment.stripeElement = {};

      await payment.tokenize();

      expect(paymentMock.createIntent).not.toHaveBeenCalled();
      expect(paymentMock.updateCart).toHaveBeenCalledWith({
        billing: { method: 'card', card: { token: 'pm_test' } },
      });
      expect(paymentMock.onSuccess).toHaveBeenCalled();
    });
  },
);
