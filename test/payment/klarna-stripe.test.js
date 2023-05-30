import { describePayment } from './utils';
import { UnableAuthenticatePaymentMethodError } from '../../src/utils/errors';
import StripeKlarnaPayment from '../../src/payment/klarna/stripe';

jest.mock('../../src/utils/stripe', () => ({
  getKlarnaIntentDetails: () => 'Test intent details',
  getKlarnaConfirmationDetails: () => 'Test confirmation details',
}));

describePayment('payment/klarna/stripe', (request, options, paymentMock) => {
  let params;
  let methods;

  const confirmKlarnaPaymentMock = jest.fn(() => ({}));
  const retrievePaymentIntentMock = jest.fn(() => ({
    paymentIntent: {
      id: 'pi_klarna_test',
      payment_method: 'pm_klarna_test',
    },
  }));

  beforeEach(() => {
    params = {};
    methods = {
      card: {
        publishable_key: 'test_stripe_publishable_key',
      },
      klarna: {},
    };

    global.window.Stripe = jest.fn(() => ({
      confirmKlarnaPayment: confirmKlarnaPaymentMock,
      retrievePaymentIntent: retrievePaymentIntentMock,
    }));
  });

  describe('#tokenize', () => {
    it('should create and confirm Stripe Klarna intent', async () => {
      const payment = new StripeKlarnaPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.tokenize();

      expect(global.window.Stripe).toHaveBeenCalledWith(
        'test_stripe_publishable_key',
      );
      expect(paymentMock.createIntent).toHaveBeenCalledWith({
        gateway: 'stripe',
        intent: 'Test intent details',
      });
      expect(confirmKlarnaPaymentMock).toHaveBeenCalledWith(
        'test_stripe_client_secret',
        'Test confirmation details',
      );
    });
  });

  describe('#handleRedirect', () => {
    it('should handle redirect with succeeded redirect status', async () => {
      const queryParams = {
        redirect_status: 'succeeded',
        payment_intent_client_secret: 'test_intent_client_secret',
      };
      const payment = new StripeKlarnaPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.handleRedirect(queryParams);

      expect(paymentMock.updateCart).toHaveBeenCalledWith({
        billing: {
          method: 'klarna',
          klarna: { token: 'pm_klarna_test' },
          intent: { stripe: { id: 'pi_klarna_test' } },
        },
      });
    });

    it('should throw an error when the redirect status is not "succeeded"', async () => {
      const queryParams = {
        redirect_status: 'failed',
      };
      const payment = new StripeKlarnaPayment(
        request,
        options,
        params,
        methods,
      );

      await expect(payment.handleRedirect(queryParams)).rejects.toThrow(
        UnableAuthenticatePaymentMethodError,
      );
    });
  });
});
