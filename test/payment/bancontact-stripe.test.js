import { describePayment } from './utils';
import { UnableAuthenticatePaymentMethodError } from '../../src/utils/errors';
import StripeBancontactPayment from '../../src/payment/bancontact/stripe';

jest.mock('../../src/utils/stripe', () => ({
  getBancontactConfirmationDetails: () => 'Test confirmation details',
}));

describePayment(
  'payment/bancontact/stripe',
  (request, options, paymentMock) => {
    let params;
    let methods;

    const confirmBancontactSetup = jest.fn(() => ({}));
    const retrieveSetupIntent = jest.fn(() => ({
      setupIntent: {
        id: 'seti_bancontact_test',
      },
    }));

    beforeEach(() => {
      params = {};
      methods = {
        card: {
          publishable_key: 'test_stripe_publishable_key',
        },
        bancontact: {},
      };

      global.window.Stripe = jest.fn(() => ({
        confirmBancontactSetup: confirmBancontactSetup,
        retrieveSetupIntent: retrieveSetupIntent,
      }));
    });

    describe('#tokenize', () => {
      it('should create and confirm Stripe Bancontact Setup Intent', async () => {
        paymentMock.getCart.mockImplementationOnce(() =>
          Promise.resolve({
            account_id: 'test_account_id',
          }),
        );

        const payment = new StripeBancontactPayment(
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
          account_id: 'test_account_id',
          gateway: 'stripe',
          action: 'setup',
          intent: {
            payment_method_types: ['bancontact'],
            usage: 'off_session',
          },
        });
        expect(confirmBancontactSetup).toHaveBeenCalledWith(
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
        const payment = new StripeBancontactPayment(
          request,
          options,
          params,
          methods,
        );

        await payment.handleRedirect(queryParams);

        expect(paymentMock.updateCart).toHaveBeenCalledWith({
          billing: {
            method: 'bancontact',
            bancontact: { token: 'seti_bancontact_test' },
          },
        });
      });

      it('should throw an error when the redirect status is not "succeeded"', async () => {
        const queryParams = {
          redirect_status: 'failed',
        };
        const payment = new StripeBancontactPayment(
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
  },
);
