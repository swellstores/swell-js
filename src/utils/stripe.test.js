import { createPaymentMethod, createIDealPaymentMethod } from './stripe';

describe('utils/stripe', () => {
  describe('#createPaymentMethod', () => {
    const card = {
      token: 'pm_id',
      last4: '4242',
      exp_month: 12,
      exp_year: 99,
      brand: 'Visa',
      address_check: 'address_line1_check',
      cvc_check: 'cvc_check',
      zip_check: 'address_zip_check',
    };

    const stripe = {
      createPaymentMethod: jest.fn((data) => {
        if (data.card === 'invalid_card_element') {
          return { error: 'Invalid card element' };
        }

        return {
          paymentMethod: {
            id: 'pm_id',
            card: {
              last4: '4242',
              exp_month: 12,
              exp_year: 99,
              brand: 'Visa',
              checks: {
                address_line1_check: 'address_line1_check',
                cvc_check: 'cvc_check',
                address_zip_check: 'address_zip_check',
              },
            },
          },
        };
      }),
    };

    const cart = {
      account: {
        email: 'test@email.com',
      },
      billing: {
        name: 'name',
        phone: 'phone',
        city: 'city',
        country: 'country',
        address1: 'address1',
        address2: 'address2',
        zip: 'zip',
        state: 'state',
      },
    };

    it('should create Stripe payment method', async () => {
      const paymentMethod = await createPaymentMethod(
        stripe,
        'card_element',
        cart,
      );

      expect(paymentMethod).toEqual(card);
      expect(stripe.createPaymentMethod).toHaveBeenCalledWith({
        type: 'card',
        card: 'card_element',
        billing_details: {
          name: 'name',
          phone: 'phone',
          email: 'test@email.com',
          address: {
            line1: 'address1',
            line2: 'address2',
            city: 'city',
            country: 'country',
            postal_code: 'zip',
            state: 'state',
          },
        },
      });
    });

    it('should return an error when card element is invalid', async () => {
      const paymentMethod = await createPaymentMethod(
        stripe,
        'invalid_card_element',
        cart,
      );

      expect(paymentMethod.error).toBe('Invalid card element');
    });
  });

  describe('#createIDealPaymentMethod', () => {
    const stripe = {
      createPaymentMethod: jest.fn((data) => {
        if (data.ideal === 'wrong_card') {
          return { error: 'Card error' };
        }
        return {
          paymentMethod: {
            id: 'pm_id',
            card: {
              last4: '4242',
              exp_month: 12,
              exp_year: 99,
              brand: 'Visa',
              checks: {
                address_line1_check: 'address_line1_check',
                cvc_check: 'cvc_check',
                address_zip_check: 'address_zip_check',
              },
            },
          },
        };
      }),
    };

    const cart = {
      account: {
        email: 'test@email.com',
      },
      billing: {
        name: 'name',
        phone: 'phone',
        city: 'city',
        country: 'country',
        address1: 'address1',
        address2: 'address2',
        zip: 'zip',
        state: 'state',
      },
    };

    it('should create Stripe payment method', async () => {
      const { paymentMethod } = await createIDealPaymentMethod(
        stripe,
        'card_element',
        cart,
      );

      expect(paymentMethod).toEqual({
        id: 'pm_id',
        card: {
          last4: '4242',
          exp_month: 12,
          exp_year: 99,
          brand: 'Visa',
          checks: {
            address_line1_check: 'address_line1_check',
            cvc_check: 'cvc_check',
            address_zip_check: 'address_zip_check',
          },
        },
      });
      expect(stripe.createPaymentMethod).toHaveBeenCalledWith({
        type: 'ideal',
        ideal: 'card_element',
        billing_details: {
          name: 'name',
          phone: 'phone',
          email: 'test@email.com',
          address: {
            line1: 'address1',
            line2: 'address2',
            city: 'city',
            country: 'country',
            postal_code: 'zip',
            state: 'state',
          },
        },
      });
    });

    it('should return an error when an invalid card is passed', async () => {
      const paymentMethod = await createIDealPaymentMethod(
        stripe,
        'wrong_card',
        cart,
      );
      expect(paymentMethod.error).toBe('Card error');
    });
  });
});
