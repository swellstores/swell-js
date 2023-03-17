import { describePayment } from './utils';
import { UnableAuthenticatePaymentMethodError } from '../../src/utils/errors';
import AmazonDirectPayment from '../../src/payment/amazon/amazon';

describePayment('payment/amazon', (request, options, paymentMock) => {
  let params;
  let methods;

  beforeEach(() => {
    params = {
      elementId: 'custom-amazon-element-id',
      locale: 'de_DE',
      placement: 'Home',
      style: {
        color: 'DarkGray',
      },
      require: {
        shipping: true,
      },
      classes: {
        base: 'test-base-class-name',
      },
    };
    methods = {
      amazon: {
        merchant_id: 'test_amazon_merchant_id',
        public_key_id: 'test_amazon_public_key_id',
      },
    };
  });

  describe('#createElements', () => {
    beforeEach(() => {
      global.window.amazon = {
        Pay: {
          renderButton: jest.fn(),
        },
      };

      global.document = {
        getElementById: jest.fn(() => ({
          classList: {
            add: jest.fn(),
          },
        })),
      };
    });

    it('should create elements', async () => {
      paymentMock.getCart.mockImplementation(() =>
        Promise.resolve({ currency: 'EUR' }),
      );

      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.createElements();

      expect(paymentMock.authorizeGateway).toHaveBeenCalledWith({
        gateway: 'amazon',
        params: {
          chargePermissionType: 'OneTime',
          webCheckoutDetails: {
            checkoutCancelUrl:
              'http://test.swell.test/checkout?gateway=amazon&redirect_status=canceled',
            checkoutReviewReturnUrl:
              'http://test.swell.test/checkout?gateway=amazon&redirect_status=succeeded',
          },
        },
      });
      expect(global.document.getElementById).toHaveBeenCalledWith(
        'custom-amazon-element-id',
      );
      expect(global.window.amazon.Pay.renderButton).toHaveBeenCalledWith(
        '#custom-amazon-element-id',
        {
          buttonColor: 'DarkGray',
          checkoutLanguage: 'de_DE',
          createCheckoutSessionConfig: {
            payloadJSON: 'test_amazon_session_payload',
            signature: 'test_amazon_session_signature',
          },
          ledgerCurrency: 'EUR',
          merchantId: 'test_amazon_merchant_id',
          placement: 'Home',
          productType: 'PayAndShip',
          publicKeyId: 'test_amazon_public_key_id',
        },
      );
    });

    it('should create elements with default params', async () => {
      paymentMock.getCart.mockImplementation(() =>
        Promise.resolve({ currency: 'EUR' }),
      );

      params = {};

      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.createElements();

      expect(paymentMock.authorizeGateway).toHaveBeenCalledWith({
        gateway: 'amazon',
        params: {
          chargePermissionType: 'OneTime',
          webCheckoutDetails: {
            checkoutCancelUrl:
              'http://test.swell.test/checkout?gateway=amazon&redirect_status=canceled',
            checkoutReviewReturnUrl:
              'http://test.swell.test/checkout?gateway=amazon&redirect_status=succeeded',
          },
        },
      });
      expect(global.document.getElementById).toHaveBeenCalledWith(
        'amazonpay-button',
      );
      expect(global.window.amazon.Pay.renderButton).toHaveBeenCalledWith(
        '#amazonpay-button',
        {
          buttonColor: 'Gold',
          checkoutLanguage: 'en_US',
          createCheckoutSessionConfig: {
            payloadJSON: 'test_amazon_session_payload',
            signature: 'test_amazon_session_signature',
          },
          ledgerCurrency: 'EUR',
          merchantId: 'test_amazon_merchant_id',
          placement: 'Checkout',
          productType: 'PayOnly',
          publicKeyId: 'test_amazon_public_key_id',
        },
      );
    });

    it('should create elements with subscription delivery', async () => {
      paymentMock.getCart.mockImplementation(() =>
        Promise.resolve({ subscription_delivery: true, currency: 'EUR' }),
      );

      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.createElements();

      expect(paymentMock.authorizeGateway).toHaveBeenCalledWith({
        gateway: 'amazon',
        params: {
          chargePermissionType: 'Recurring',
          recurringMetadata: {
            frequency: {
              unit: 'Variable',
              value: '0',
            },
          },
          webCheckoutDetails: {
            checkoutCancelUrl:
              'http://test.swell.test/checkout?gateway=amazon&redirect_status=canceled',
            checkoutReviewReturnUrl:
              'http://test.swell.test/checkout?gateway=amazon&redirect_status=succeeded',
          },
        },
      });
      expect(global.document.getElementById).toHaveBeenCalledWith(
        'custom-amazon-element-id',
      );
      expect(global.window.amazon.Pay.renderButton).toHaveBeenCalledWith(
        '#custom-amazon-element-id',
        {
          buttonColor: 'DarkGray',
          checkoutLanguage: 'de_DE',
          createCheckoutSessionConfig: {
            payloadJSON: 'test_amazon_session_payload',
            signature: 'test_amazon_session_signature',
          },
          ledgerCurrency: 'EUR',
          merchantId: 'test_amazon_merchant_id',
          placement: 'Home',
          productType: 'PayAndShip',
          publicKeyId: 'test_amazon_public_key_id',
        },
      );
    });
  });

  describe('#tokenize', () => {
    it('should initiate Amazon Pay payment', async () => {
      paymentMock.getCart.mockImplementation(() =>
        Promise.resolve({
          billing: {
            amazon: {
              checkout_session_id: 'test_amazon_checkout_session_id',
            },
          },
          capture_total: 10,
          currency: 'EUR',
        }),
      );

      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.tokenize();

      expect(paymentMock.createIntent).toHaveBeenCalledWith({
        gateway: 'amazon',
        intent: {
          checkoutSessionId: 'test_amazon_checkout_session_id',
          paymentDetails: {
            canHandlePendingAuthorization: true,
            chargeAmount: { amount: 10, currencyCode: 'EUR' },
            paymentIntent: 'Authorize',
          },
          webCheckoutDetails: {
            checkoutCancelUrl:
              'http://test.swell.test/checkout?gateway=amazon&redirect_status=canceled',
            checkoutResultReturnUrl:
              'http://test.swell.test/checkout?gateway=amazon&confirm=true&redirect_status=succeeded',
          },
        },
      });
      expect(global.window.location.replace).toHaveBeenCalledWith(
        'https://www.amazon.com/',
      );
    });

    it('should initiate Amazon Pay payment when capture total is 0', async () => {
      paymentMock.getCart.mockImplementation(() =>
        Promise.resolve({
          billing: {
            amazon: {
              checkout_session_id: 'test_amazon_checkout_session_id',
            },
          },
          capture_total: 0,
          currency: 'EUR',
        }),
      );

      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.tokenize();

      expect(paymentMock.createIntent).toHaveBeenCalledWith({
        gateway: 'amazon',
        intent: {
          checkoutSessionId: 'test_amazon_checkout_session_id',
          paymentDetails: {
            paymentIntent: 'Confirm',
          },
          webCheckoutDetails: {
            checkoutCancelUrl:
              'http://test.swell.test/checkout?gateway=amazon&redirect_status=canceled',
            checkoutResultReturnUrl:
              'http://test.swell.test/checkout?gateway=amazon&confirm=true&redirect_status=succeeded',
          },
        },
      });
      expect(global.window.location.replace).toHaveBeenCalledWith(
        'https://www.amazon.com/',
      );
    });
  });

  describe('#handleRedirect', () => {
    it('should handle redirect with succeeded redirect status', async () => {
      const queryParams = {
        redirect_status: 'succeeded',
        amazonCheckoutSessionId: 'test_amazon_checkout_session_id',
      };
      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.handleRedirect(queryParams);

      expect(paymentMock.updateCart).toHaveBeenCalledWith({
        billing: {
          amazon: { checkout_session_id: 'test_amazon_checkout_session_id' },
          method: 'amazon',
        },
      });
      expect(paymentMock.onSuccess).toHaveBeenCalled();
    });

    it('should not update cart on payment confirmation', async () => {
      const queryParams = {
        redirect_status: 'succeeded',
        amazonCheckoutSessionId: 'test_amazon_checkout_session_id',
        confirm: true,
      };
      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await payment.handleRedirect(queryParams);

      expect(paymentMock.updateCart).not.toHaveBeenCalled();
      expect(paymentMock.onSuccess).toHaveBeenCalled();
    });

    it('should throw an error when the redirect status is canceled', async () => {
      const queryParams = {
        redirect_status: 'canceled',
      };
      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await expect(payment.handleRedirect(queryParams)).rejects.toThrow(
        UnableAuthenticatePaymentMethodError,
      );
    });

    it('should throw an error when the redirect status is unknown', async () => {
      const queryParams = {
        redirect_status: 'unknown',
      };
      const payment = new AmazonDirectPayment(
        request,
        options,
        params,
        methods,
      );

      await expect(payment.handleRedirect(queryParams)).rejects.toThrow(
        'Unknown redirect status: unknown',
      );
    });
  });
});
