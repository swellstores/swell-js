import { describePayment } from './utils';
import { UnableAuthenticatePaymentMethodError } from '../../src/utils/errors';
import StripeIDealPayment from '../../src/payment/ideal/stripe';

jest.mock('../../src/utils/stripe', () => ({
  ...jest.requireActual('../../src/utils/stripe'),
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
    StripeIDealPayment.stripeElement = null;
    StripeIDealPayment.stripeElements = null;
  });

  describe('payment element', () => {
    const cart = {
      currency: 'EUR',
      capture_total: 10,
      billing: { name: 'Jan Jansen', country: 'NL' },
    };
    let stripe;
    let elements;
    let element;

    beforeEach(() => {
      element = { on: jest.fn(), mount: jest.fn() };
      elements = {
        create: jest.fn(() => element),
        update: jest.fn(),
        submit: jest.fn(async () => ({})),
      };
      stripe = {
        elements: jest.fn(() => elements),
        createPaymentMethod: jest.fn(async () => ({
          paymentMethod: { id: 'pm_ideal_pe' },
        })),
        handleCardAction: handleCardActionMock,
      };
      global.window.Stripe = jest.fn(() => stripe);
    });

    it('should mount the iDEAL Payment Element', async () => {
      const appearance = { labels: 'floating' };
      const payment = new StripeIDealPayment(
        request,
        options,
        { paymentElement: true, appearance, elementId: 'ideal-element' },
        methods,
      );

      await payment.createElements(cart);

      expect(stripe.elements).toHaveBeenCalledWith({
        mode: 'payment',
        amount: 1000,
        currency: 'eur',
        paymentMethodTypes: ['ideal'],
        paymentMethodCreation: 'manual',
        appearance,
      });
      expect(elements.create).toHaveBeenCalledWith('payment', {
        layout: 'tabs',
        fields: { billingDetails: 'never' },
        wallets: { applePay: 'never', googlePay: 'never' },
      });
      expect(element.mount).toHaveBeenCalledWith('#ideal-element');
      expect(payment.stripeElements).toBe(elements);
    });

    it('should create the intent with the Payment Element payment method', async () => {
      global.window.location.href = 'http://test.swell.test/checkout';
      paymentMock.getCart.mockResolvedValueOnce(cart);
      paymentMock.createIntent.mockResolvedValueOnce({
        id: 'pi_1',
        client_secret: 'cs_1',
        status: 'requires_action',
      });

      const payment = new StripeIDealPayment(
        request,
        options,
        { paymentElement: true },
        methods,
      );
      payment.stripeElements = elements;

      await payment.tokenize();

      expect(elements.update).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 1000, currency: 'eur' }),
      );
      expect(stripe.createPaymentMethod).toHaveBeenCalledWith({
        elements,
        params: {
          billing_details: expect.objectContaining({
            name: 'Jan Jansen',
            address: expect.objectContaining({ country: 'NL' }),
          }),
        },
      });
      expect(paymentMock.createIntent.mock.calls[0][0].intent).toMatchObject({
        payment_method: 'pm_ideal_pe',
        payment_method_types: 'ideal',
        return_url: 'http://test.swell.test/checkout?gateway=stripe',
      });
      expect(paymentMock.updateCart).toHaveBeenCalledWith({
        billing: {
          method: 'ideal',
          ideal: { token: 'pm_ideal_pe' },
          intent: { stripe: { id: 'pi_1' } },
        },
      });
      expect(handleCardActionMock).toHaveBeenCalledWith('cs_1');
    });

    it('should throw the submit error', async () => {
      elements.submit.mockResolvedValueOnce({
        error: { message: 'Select your bank.' },
      });
      paymentMock.getCart.mockResolvedValueOnce(cart);

      const payment = new StripeIDealPayment(
        request,
        options,
        { paymentElement: true },
        methods,
      );
      payment.stripeElements = elements;

      await expect(payment.tokenize()).rejects.toThrow('Select your bank.');
      expect(stripe.createPaymentMethod).not.toHaveBeenCalled();
      expect(paymentMock.createIntent).not.toHaveBeenCalled();
    });
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
