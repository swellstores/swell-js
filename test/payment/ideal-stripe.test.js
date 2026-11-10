import { describePayment } from './utils';
import { UnableAuthenticatePaymentMethodError } from '../../src/utils/errors';
import StripeIDealPayment from '../../src/payment/ideal/stripe';

jest.mock('../../src/utils/stripe', () => ({
  createElement: jest.fn(),
  createIDealPaymentMethod: () => ({ paymentMethod: { id: 'pm_ideal' } }),
  stripeAmountByCurrency: (_currency, amount) => amount * 100,
}));

describePayment('payment/ideal/stripe', (request, options, paymentMock) => {
  let methods;
  const retrievePaymentIntentMock = jest.fn();
  const handleCardActionMock = jest.fn();

  beforeEach(() => {
    methods = { card: { publishable_key: 'pk' }, ideal: {} };
    global.window.location.href = 'http://test.swell.test/checkout?step=pay';
    global.window.Stripe = jest.fn(() => ({
      retrievePaymentIntent: retrievePaymentIntentMock,
      handleCardAction: handleCardActionMock,
    }));
    StripeIDealPayment.stripe = null;
  });

  describe('#tokenize', () => {
    it('should send the gateway in the return url', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        currency: 'EUR',
        capture_total: 10,
      });
      paymentMock.createIntent.mockResolvedValueOnce({
        id: 'pi_1',
        client_secret: 'cs_1',
        status: 'requires_action',
      });

      const payment = new StripeIDealPayment(request, options, {}, methods);
      payment.stripeElement = {};

      await payment.tokenize();

      expect(paymentMock.createIntent.mock.calls[0][0].intent.return_url).toBe(
        'http://test.swell.test/checkout?step=pay&gateway=stripe',
      );
      expect(handleCardActionMock).toHaveBeenCalledWith('cs_1');
    });
  });

  describe('#handleRedirect', () => {
    it('should succeed when the intent is paid', async () => {
      retrievePaymentIntentMock.mockResolvedValueOnce({
        paymentIntent: { status: 'succeeded' },
      });

      const payment = new StripeIDealPayment(request, options, {}, methods);

      await payment.handleRedirect({
        redirect_status: 'succeeded',
        payment_intent_client_secret: 'cs_1',
      });

      expect(retrievePaymentIntentMock).toHaveBeenCalledWith('cs_1');
      expect(paymentMock.updateCart).not.toHaveBeenCalled();
      expect(paymentMock.onSuccess).toHaveBeenCalled();
    });

    it('should throw the payment error when the intent failed', async () => {
      retrievePaymentIntentMock.mockResolvedValueOnce({
        paymentIntent: {
          status: 'requires_payment_method',
          last_payment_error: { message: 'Bank refused' },
        },
      });

      const payment = new StripeIDealPayment(request, options, {}, methods);

      await expect(
        payment.handleRedirect({
          redirect_status: 'succeeded',
          payment_intent_client_secret: 'cs_1',
        }),
      ).rejects.toThrow('Bank refused');
    });

    it('should throw when the redirect status is not succeeded', async () => {
      const payment = new StripeIDealPayment(request, options, {}, methods);

      await expect(
        payment.handleRedirect({ redirect_status: 'failed' }),
      ).rejects.toThrow(UnableAuthenticatePaymentMethodError);
    });
  });
});
