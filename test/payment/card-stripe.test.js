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

const stripeCardPaymentMethod = {
  id: 'pm_card',
  card: {
    last4: '4242',
    exp_month: 12,
    exp_year: 2030,
    brand: 'visa',
    display_brand: 'visa',
    checks: {
      address_line1_check: null,
      cvc_check: 'pass',
      address_postal_code_check: 'pass',
    },
  },
};

function mockStripe() {
  const element = { on: jest.fn(), mount: jest.fn() };
  const elements = {
    create: jest.fn(() => element),
    update: jest.fn(),
    submit: jest.fn(async () => ({})),
  };
  const stripe = {
    elements: jest.fn(() => elements),
    createPaymentMethod: jest.fn(async () => ({
      paymentMethod: stripeCardPaymentMethod,
    })),
    confirmCardPayment: jest.fn(),
  };

  global.window.Stripe = jest.fn(() => stripe);

  return { stripe, elements, element };
}

describePayment(
  'payment/card/stripe payment element',
  (request, options, paymentMock) => {
    const methods = { card: { publishable_key: 'pk', mode: 'live' } };
    const appearance = { labels: 'floating', variables: { colorText: '#111' } };
    const cart = {
      currency: 'USD',
      capture_total: 10,
      auth_total: 0.5,
      billing: { name: 'Jane Doe', address1: 'Main 1', city: 'Austin' },
      account: { email: 'jane@example.com' },
    };
    let StripeCardPayment;

    beforeEach(() => {
      StripeCardPayment = require('../../src/payment/card/stripe').default;
      StripeCardPayment.stripe = null;
      StripeCardPayment.stripeElement = null;
      StripeCardPayment.stripeElements = null;
    });

    describe('#createElements', () => {
      it('should mount the Payment Element in payment mode', async () => {
        const { stripe, elements, element } = mockStripe();
        const onChange = jest.fn();
        const payment = new StripeCardPayment(
          request,
          options,
          { paymentElement: true, appearance, onChange },
          methods,
        );

        await payment.createElements(cart);

        expect(stripe.elements).toHaveBeenCalledWith({
          mode: 'payment',
          amount: 1050,
          currency: 'usd',
          captureMethod: 'manual',
          setupFutureUsage: 'off_session',
          paymentMethodTypes: ['card'],
          paymentMethodCreation: 'manual',
          appearance,
        });
        expect(elements.create).toHaveBeenCalledWith('payment', {
          layout: 'tabs',
          fields: { billingDetails: 'never' },
          wallets: { applePay: 'never', googlePay: 'never' },
        });
        expect(element.on).toHaveBeenCalledWith('change', onChange);
        expect(element.mount).toHaveBeenCalledWith('#payment-element');
        expect(payment.stripeElements).toBe(elements);
        expect(payment.stripeElement).toBeNull();
      });

      it('should use setup mode and the caller options when the amount is not chargeable', async () => {
        const { stripe, elements, element } = mockStripe();
        const payment = new StripeCardPayment(
          request,
          options,
          {
            paymentElement: true,
            elementId: 'card-form',
            options: { layout: 'accordion' },
          },
          methods,
        );

        await payment.createElements({ currency: 'EUR', capture_total: 0 });

        expect(stripe.elements).toHaveBeenCalledWith({
          mode: 'setup',
          currency: 'eur',
          paymentMethodTypes: ['card'],
          paymentMethodCreation: 'manual',
        });
        expect(elements.create.mock.calls[0][1].layout).toBe('accordion');
        expect(element.mount).toHaveBeenCalledWith('#card-form');
      });

      it('should keep the split card elements without the flag', async () => {
        const { stripe, elements, element } = mockStripe();
        const payment = new StripeCardPayment(
          request,
          options,
          { config: { locale: 'en' }, options: { style: {} } },
          methods,
        );

        await payment.createElements(cart);

        expect(stripe.elements).toHaveBeenCalledWith({ locale: 'en' });
        expect(elements.create).toHaveBeenCalledWith('card', { style: {} });
        expect(element.mount).toHaveBeenCalledWith('#card-element');
        expect(payment.stripeElement).toBe(element);
      });
    });

    describe('#tokenize', () => {
      it('should create the payment method from the elements and reuse the intent flow', async () => {
        const { stripe, elements } = mockStripe();
        paymentMock.getCart.mockResolvedValueOnce({
          ...cart,
          capture_total: 20,
        });
        paymentMock.createIntent.mockResolvedValueOnce({
          id: 'pi_1',
          client_secret: 'cs_1',
          status: 'requires_capture',
        });

        const payment = new StripeCardPayment(
          request,
          options,
          { paymentElement: true },
          methods,
        );
        payment.stripeElements = elements;

        await payment.tokenize();

        expect(elements.update).toHaveBeenCalledWith(
          expect.objectContaining({ mode: 'payment', amount: 2050 }),
        );
        expect(elements.update.mock.invocationCallOrder[0]).toBeLessThan(
          elements.submit.mock.invocationCallOrder[0],
        );
        expect(stripe.createPaymentMethod).toHaveBeenCalledWith({
          elements,
          params: {
            billing_details: {
              name: 'Jane Doe',
              email: 'jane@example.com',
              phone: null,
              address: {
                line1: 'Main 1',
                line2: null,
                city: 'Austin',
                state: null,
                postal_code: null,
                country: null,
              },
            },
          },
        });
        expect(paymentMock.createIntent.mock.calls[0][0].intent).toMatchObject({
          amount: 2050,
          currency: 'usd',
          payment_method: 'pm_card',
          capture_method: 'manual',
          setup_future_usage: 'off_session',
        });
        expect(paymentMock.updateCart).toHaveBeenCalledWith({
          billing: {
            method: 'card',
            card: {
              gateway: 'stripe',
              token: 'pm_card',
              last4: '4242',
              exp_month: 12,
              exp_year: 2030,
              brand: 'visa',
              display_brand: 'visa',
              address_check: null,
              cvc_check: 'pass',
              zip_check: 'pass',
            },
            intent: { stripe: { id: 'pi_1', auth_amount: 0.5 } },
          },
        });
        expect(paymentMock.onSuccess).toHaveBeenCalled();
      });

      it('should store the card without an intent when the amount is not chargeable', async () => {
        const { elements } = mockStripe();
        paymentMock.getCart.mockResolvedValueOnce({
          ...cart,
          capture_total: 0,
        });

        const payment = new StripeCardPayment(
          request,
          options,
          { paymentElement: true },
          methods,
        );
        payment.stripeElements = elements;

        await payment.tokenize();

        expect(elements.update).not.toHaveBeenCalled();
        expect(paymentMock.createIntent).not.toHaveBeenCalled();
        expect(paymentMock.updateCart.mock.calls[0][0].billing.card.token).toBe(
          'pm_card',
        );
      });

      it('should throw the submit error before creating the payment method', async () => {
        const { stripe, elements } = mockStripe();
        elements.submit.mockResolvedValueOnce({
          error: { message: 'Your card number is incomplete.' },
        });
        paymentMock.getCart.mockResolvedValueOnce(cart);

        const payment = new StripeCardPayment(
          request,
          options,
          { paymentElement: true },
          methods,
        );
        payment.stripeElements = elements;

        await expect(payment.tokenize()).rejects.toThrow(
          'Your card number is incomplete.',
        );
        expect(stripe.createPaymentMethod).not.toHaveBeenCalled();
        expect(paymentMock.updateCart).not.toHaveBeenCalled();
      });

      it('should throw when the Payment Element was not created', async () => {
        mockStripe();

        const payment = new StripeCardPayment(
          request,
          options,
          { paymentElement: true },
          methods,
        );
        payment.stripeElement = {};

        await expect(payment.tokenize()).rejects.toThrow(
          'Stripe payment element is not defined',
        );
      });
    });
  },
);
