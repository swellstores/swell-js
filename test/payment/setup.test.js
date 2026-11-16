import { describePayment } from './utils';

import PaymentController from '../../src/payment';
import StripeCardPayment from '../../src/payment/card/stripe';

const stripePaymentMethod = {
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
  const element = { on: jest.fn(), mount: jest.fn(), destroy: jest.fn() };
  const elements = {
    create: jest.fn(() => element),
    getElement: jest.fn(() => element),
    update: jest.fn(),
    submit: jest.fn(async () => ({})),
  };
  const stripe = {
    elements: jest.fn(() => elements),
    createPaymentMethod: jest.fn(async () => ({
      paymentMethod: stripePaymentMethod,
    })),
    confirmCardSetup: jest.fn(async () => ({
      setupIntent: { status: 'succeeded' },
    })),
  };

  global.window.Stripe = jest.fn(() => stripe);

  return { stripe, elements, element };
}

describePayment(
  'payment#setupPaymentMethod',
  (request, options, paymentMock) => {
    const createToken = jest.fn();
    let payment;

    const withCard = (card) => {
      payment._getPaymentMethods = async () => ({ card });
    };

    beforeEach(() => {
      StripeCardPayment.stripe = null;
      StripeCardPayment.stripeElements = null;
      payment = new PaymentController(
        { ...request, card: { createToken } },
        options,
      );
    });

    describe('stripe', () => {
      const getSetupIntent = jest.fn(async () => ({ client_secret: 'seti_1' }));
      const card = {
        elementId: 'portal-card',
        options: { layout: 'accordion' },
        getSetupIntent,
      };

      beforeEach(() => {
        withCard({ gateway: 'stripe', publishable_key: 'pk', mode: 'live' });
      });

      it('should mount the Payment Element in setup mode without a cart', async () => {
        const { stripe, elements, element } = mockStripe();
        const checkoutElements = {};
        StripeCardPayment.stripeElements = checkoutElements;

        await payment.setupPaymentMethod({ card });

        expect(stripe.elements).toHaveBeenCalledWith({
          mode: 'setup',
          currency: 'eur',
          paymentMethodTypes: ['card'],
          paymentMethodCreation: 'manual',
        });
        expect(elements.create).toHaveBeenCalledWith('payment', {
          layout: 'accordion',
          fields: { billingDetails: 'never' },
          wallets: { applePay: 'never', googlePay: 'never' },
        });
        expect(element.mount).toHaveBeenCalledWith('#portal-card');
        expect(getSetupIntent).not.toHaveBeenCalled();
        expect(paymentMock.getCart).not.toHaveBeenCalled();
        // a checkout's tokenize on the same page keeps its own elements
        expect(StripeCardPayment.stripeElements).toBe(checkoutElements);
      });

      it('should pass onReady to the Payment Element', async () => {
        const { element } = mockStripe();
        const onReady = jest.fn();

        await payment.setupPaymentMethod({ card: { ...card, onReady } });

        expect(element.on).toHaveBeenCalledWith('ready', onReady);
      });

      it('should reject before mounting without getSetupIntent', async () => {
        const { stripe } = mockStripe();

        await expect(
          payment.setupPaymentMethod({ card: { elementId: 'portal-card' } }),
        ).rejects.toThrow('getSetupIntent');
        expect(stripe.elements).not.toHaveBeenCalled();
      });

      it('should remove the Payment Element once on destroy', async () => {
        const { element } = mockStripe();

        const setup = await payment.setupPaymentMethod({ card });
        setup.destroy();
        setup.destroy();

        expect(element.destroy).toHaveBeenCalledTimes(1);
      });

      it('should confirm the host SetupIntent with the new payment method', async () => {
        const { stripe, elements } = mockStripe();

        const setup = await payment.setupPaymentMethod({ card });
        const result = await setup.confirm();

        expect(elements.update).not.toHaveBeenCalled();
        expect(stripe.createPaymentMethod).toHaveBeenCalledWith({
          elements,
          params: {
            billing_details: {
              name: null,
              email: null,
              phone: null,
              address: {
                line1: null,
                line2: null,
                city: null,
                state: null,
                postal_code: null,
                country: null,
              },
            },
          },
        });
        expect(stripe.confirmCardSetup).toHaveBeenCalledWith('seti_1', {
          payment_method: 'pm_card',
        });
        expect(result).toEqual({
          gateway: 'stripe',
          token: 'pm_card',
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2030,
        });
        expect(paymentMock.getCart).not.toHaveBeenCalled();
        expect(paymentMock.updateCart).not.toHaveBeenCalled();
      });

      it('should reject with the field error before asking for a SetupIntent', async () => {
        const { stripe, elements } = mockStripe();
        elements.submit.mockResolvedValueOnce({
          error: {
            message: 'Your card number is incomplete.',
            type: 'validation_error',
            code: 'incomplete_number',
          },
        });

        const setup = await payment.setupPaymentMethod({ card });

        await expect(setup.confirm()).rejects.toMatchObject({
          message: 'Your card number is incomplete.',
          type: 'validation_error',
          code: 'incomplete_number',
        });
        expect(getSetupIntent).not.toHaveBeenCalled();
        expect(stripe.confirmCardSetup).not.toHaveBeenCalled();
      });

      it.each([
        {
          message: 'We are unable to authenticate your payment method.',
          type: 'invalid_request_error',
          code: 'setup_intent_authentication_failure',
        },
        {
          message: 'Your card has insufficient funds.',
          type: 'card_error',
          code: 'card_declined',
          decline_code: 'insufficient_funds',
        },
      ])(
        'should reject with the Stripe error and its codes: $code',
        async (error) => {
          const { stripe } = mockStripe();
          stripe.confirmCardSetup.mockResolvedValueOnce({ error });

          const setup = await payment.setupPaymentMethod({ card });

          await expect(setup.confirm()).rejects.toMatchObject(error);
        },
      );

      it('should reject when the SetupIntent has not succeeded', async () => {
        const { stripe } = mockStripe();
        stripe.confirmCardSetup.mockResolvedValueOnce({
          setupIntent: { status: 'processing' },
        });

        const setup = await payment.setupPaymentMethod({ card });

        await expect(setup.confirm()).rejects.toThrow(
          'Unsupported setup intent status: processing',
        );
      });

      it('should pass on the host error from getSetupIntent unchanged', async () => {
        const { stripe } = mockStripe();
        const hostError = Object.assign(new Error('Too many attempts'), {
          status: 429,
        });
        getSetupIntent.mockRejectedValueOnce(hostError);

        const setup = await payment.setupPaymentMethod({ card });

        await expect(setup.confirm()).rejects.toBe(hostError);
        expect(stripe.confirmCardSetup).not.toHaveBeenCalled();
      });

      it('should mark a card saved outside live mode as a test card', async () => {
        withCard({ gateway: 'stripe', publishable_key: 'pk', mode: 'test' });
        mockStripe();

        const setup = await payment.setupPaymentMethod({ card });

        await expect(setup.confirm()).resolves.toMatchObject({
          token: 'pm_card',
          test: true,
        });
      });
    });

    describe('other card gateways', () => {
      it('should tokenize the host fields through the vault', async () => {
        withCard({ gateway: 'authorizenet' });
        createToken.mockResolvedValueOnce({
          token: 't_1',
          brand: 'Visa',
          last4: '1111',
          exp_month: 1,
          exp_year: 2031,
          cvc_check: 'pass',
        });
        const fields = {
          number: '4111111111111111',
          exp_month: 1,
          exp_year: 2031,
          cvc: '123',
        };

        const setup = await payment.setupPaymentMethod({ card: {} });
        const result = await setup.confirm(fields);
        // the host's own fields: nothing to remove
        setup.destroy();

        expect(createToken).toHaveBeenCalledWith(fields);
        expect(result).toEqual({
          gateway: 'authorizenet',
          token: 't_1',
          brand: 'Visa',
          last4: '1111',
          exp_month: 1,
          exp_year: 2031,
        });
        expect(paymentMock.getCart).not.toHaveBeenCalled();
      });

      it('should pass on the vault error', async () => {
        withCard({ gateway: 'braintree' });
        createToken.mockRejectedValueOnce(
          new Error('Card number appears to be invalid'),
        );

        const setup = await payment.setupPaymentMethod({ card: {} });

        await expect(setup.confirm({ number: '1' })).rejects.toThrow(
          'Card number appears to be invalid',
        );
      });
    });

    it.each(['quickpay', 'saferpay', 'convesiopay'])(
      'should reject %s as an unsupported gateway',
      async (gateway) => {
        withCard({ gateway });

        await expect(
          payment.setupPaymentMethod({ card: {} }),
        ).rejects.toMatchObject({ code: 'unsupported_gateway' });
      },
    );

    it('should reject when card payments are disabled', async () => {
      withCard(undefined);

      await expect(payment.setupPaymentMethod({ card: {} })).rejects.toThrow(
        'card payments are disabled',
      );
    });
  },
);
