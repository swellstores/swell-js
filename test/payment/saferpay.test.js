import { describePayment } from './utils';
import { UnableAuthenticatePaymentMethodError } from '../../src/utils/errors';
import SaferpayCardPayment from '../../src/payment/card/saferpay';
import SaferpayTwintPayment from '../../src/payment/twint/saferpay';

const cardState = {
  Transaction: { Id: 'trx_1' },
  RegistrationResult: { Success: true, Alias: { Id: 'alias_1' } },
  PaymentMeans: {
    Brand: { PaymentMethod: 'VISA', Name: 'Visa' },
    Card: { ExpMonth: 8, ExpYear: 2028, MaskedNumber: 'xxxx xxxx xxxx 4242' },
  },
};

const twintState = {
  Transaction: { Id: 'trx_2' },
  PaymentMeans: { Brand: { PaymentMethod: 'TWINT', Name: 'TWINT' } },
};

describePayment('payment/saferpay', (request, options, paymentMock) => {
  let methods;

  beforeEach(() => {
    methods = {
      card: { gateway: 'saferpay', mode: 'test' },
      twint: { gateway: 'saferpay', mode: 'test' },
    };
  });

  describe('#tokenize', () => {
    it('should create the payment page, store the token and redirect', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        currency: 'chf',
        grand_total: 12.5,
      });
      paymentMock.createIntent.mockResolvedValueOnce({
        token: 'page_token',
        redirect_url: 'https://saferpay.test/page',
      });

      const payment = new SaferpayCardPayment(request, options, {}, methods);

      await payment.tokenize();

      expect(paymentMock.createIntent).toHaveBeenCalledWith({
        gateway: 'saferpay',
        intent: {
          Payment: {
            Amount: { Value: 1250, CurrencyCode: 'CHF' },
            Description: 'Saferpay payment powered by Swell',
          },
          PaymentMethods:
            'AMEX,DINERS,MAESTRO,JCB,VISA,BANCONTACT,MASTERCARD,SAFERPAYTEST,UNIONPAY',
          ReturnUrls: {
            Success:
              'http://test.swell.test/checkout?gateway=saferpay&redirect_status=succeeded',
            Fail: 'http://test.swell.test/checkout?gateway=saferpay&redirect_status=failed',
            Abort:
              'http://test.swell.test/checkout?gateway=saferpay&redirect_status=canceled',
          },
        },
      });
      expect(paymentMock.updateCart).toHaveBeenCalledWith({
        billing: {
          method: 'card',
          intent: { saferpay: { token: 'page_token' } },
        },
      });
      expect(window.location.replace).toHaveBeenCalledWith(
        'https://saferpay.test/page',
      );
    });

    it('should request only TWINT for the twint method', async () => {
      paymentMock.getCart.mockResolvedValueOnce({ currency: 'CHF' });
      paymentMock.createIntent.mockResolvedValueOnce({
        token: 't',
        redirect_url: 'https://saferpay.test/page',
      });

      const payment = new SaferpayTwintPayment(request, options, {}, methods);

      await payment.tokenize();

      expect(
        paymentMock.createIntent.mock.calls[0][0].intent.PaymentMethods,
      ).toBe('TWINT');
      expect(paymentMock.updateCart).toHaveBeenCalledWith({
        billing: { method: 'twint', intent: { saferpay: { token: 't' } } },
      });
    });

    it('should reuse a Saferpay card already on the cart', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        billing: { card: { gateway: 'saferpay', token: 'alias_1' } },
      });

      const payment = new SaferpayCardPayment(request, options, {}, methods);

      await payment.tokenize();

      expect(paymentMock.createIntent).not.toHaveBeenCalled();
      expect(paymentMock.onSuccess).toHaveBeenCalled();
    });

    it('should register a new card when replace is requested', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        billing: { card: { gateway: 'saferpay', token: 'alias_1' } },
      });
      paymentMock.createIntent.mockResolvedValueOnce({
        token: 't',
        redirect_url: 'https://saferpay.test/page',
      });

      const payment = new SaferpayCardPayment(
        request,
        options,
        { replace: true },
        methods,
      );

      await payment.tokenize();

      expect(paymentMock.createIntent).toHaveBeenCalled();
    });
  });

  describe('#handleRedirect', () => {
    it('should store the registered card with the transaction id', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        billing: {
          method: 'card',
          intent: { saferpay: { token: 'page_token' } },
        },
      });
      paymentMock.updateIntent.mockResolvedValueOnce({ state: cardState });

      const payment = new SaferpayCardPayment(request, options, {}, methods);

      await payment.handleRedirect({ redirect_status: 'succeeded' });

      expect(paymentMock.updateIntent).toHaveBeenCalledWith({
        gateway: 'saferpay',
        intent: { token: 'page_token' },
      });
      expect(paymentMock.updateCart).toHaveBeenCalledWith({
        billing: {
          method: 'card',
          card: {
            token: 'alias_1',
            exp_month: 8,
            exp_year: 2028,
            brand: 'Visa',
            last4: '4242',
            gateway: 'saferpay',
            test: true,
          },
          intent: { saferpay: { transaction_id: 'trx_1' } },
        },
      });
      expect(paymentMock.onSuccess).toHaveBeenCalled();
    });

    it('should store a TWINT transaction', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        billing: {
          method: 'twint',
          intent: { saferpay: { token: 'page_token' } },
        },
      });
      paymentMock.updateIntent.mockResolvedValueOnce({ state: twintState });

      const payment = new SaferpayTwintPayment(request, options, {}, methods);

      await payment.handleRedirect({ redirect_status: 'succeeded' });

      expect(paymentMock.updateCart).toHaveBeenCalledWith({
        billing: {
          method: 'twint',
          intent: { saferpay: { transaction_id: 'trx_2' } },
        },
      });
      expect(paymentMock.onSuccess).toHaveBeenCalled();
    });

    it('should leave the redirect of another Saferpay method alone', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        billing: { method: 'twint', intent: { saferpay: { token: 't' } } },
      });

      const payment = new SaferpayCardPayment(request, options, {}, methods);

      await payment.handleRedirect({ redirect_status: 'succeeded' });

      expect(paymentMock.updateIntent).not.toHaveBeenCalled();
      expect(paymentMock.onSuccess).not.toHaveBeenCalled();
    });

    it('should cancel on a canceled redirect', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        billing: { method: 'card' },
      });

      const payment = new SaferpayCardPayment(request, options, {}, methods);

      await payment.handleRedirect({ redirect_status: 'canceled' });

      expect(paymentMock.onCancel).toHaveBeenCalled();
    });

    it('should throw on a failed redirect', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        billing: { method: 'card' },
      });

      const payment = new SaferpayCardPayment(request, options, {}, methods);

      await expect(
        payment.handleRedirect({ redirect_status: 'failed' }),
      ).rejects.toThrow(UnableAuthenticatePaymentMethodError);
    });

    it('should throw when the token is missing', async () => {
      paymentMock.getCart.mockResolvedValueOnce({
        billing: { method: 'card' },
      });

      const payment = new SaferpayCardPayment(request, options, {}, methods);

      await expect(
        payment.handleRedirect({ redirect_status: 'succeeded' }),
      ).rejects.toThrow('Saferpay transaction token is not defined');
    });
  });
});
