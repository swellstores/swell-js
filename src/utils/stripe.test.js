import {
  createPaymentMethod,
  createIDealPaymentMethod,
  getKlarnaIntentDetails,
  getKlarnaConfirmationDetails,
  getPaymentRequestData,
} from './stripe';

describe('utils/stripe', () => {
  describe('#createPaymentMethod', () => {
    const card = {
      token: 'pm_id',
      last4: '4242',
      exp_month: 12,
      exp_year: 99,
      brand: 'Visa',
      display_brand: 'cartes_bancaires',
      address_check: 'address_line1_check',
      cvc_check: 'cvc_check',
      zip_check: 'address_postal_code_check',
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
              display_brand: 'cartes_bancaires',
              checks: {
                address_line1_check: 'address_line1_check',
                cvc_check: 'cvc_check',
                address_postal_code_check: 'address_postal_code_check',
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
              display_brand: 'cartes_bancaires',
              checks: {
                address_line1_check: 'address_line1_check',
                cvc_check: 'cvc_check',
                address_postal_code_check: 'address_postal_code_check',
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
          display_brand: 'cartes_bancaires',
          checks: {
            address_line1_check: 'address_line1_check',
            cvc_check: 'cvc_check',
            address_postal_code_check: 'address_postal_code_check',
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

  describe('#getKlarnaIntentDetails', () => {
    it('should return intent details', () => {
      const cart = {
        account: { stripe_customer: 'cus_test' },
        currency: 'USD',
        capture_total: 100,
      };
      const result = getKlarnaIntentDetails(cart);

      expect(result).toEqual({
        payment_method_types: 'klarna',
        currency: 'usd',
        amount: 10000,
        capture_method: 'manual',
        customer: 'cus_test',
      });
    });

    it('should return intent details without customer when cart account does not have a Stripe Customer', () => {
      const cart = {
        account: {},
        currency: 'USD',
        capture_total: 100,
      };
      const result = getKlarnaIntentDetails(cart);

      expect(result).toEqual({
        payment_method_types: 'klarna',
        currency: 'usd',
        amount: 10000,
        capture_method: 'manual',
      });
    });

    it('should return intent details without customer when cart account is not defined', () => {
      const cart = {
        currency: 'USD',
        capture_total: 100,
      };
      const result = getKlarnaIntentDetails(cart);

      expect(result).toEqual({
        payment_method_types: 'klarna',
        currency: 'usd',
        amount: 10000,
        capture_method: 'manual',
      });
    });
  });

  describe('#getKlarnaConfirmationDetails', () => {
    beforeEach(() => {
      global.window = {
        location: {
          origin: 'http://test.swell.test',
          pathname: '/checkout',
        },
      };
    });

    afterEach(() => {
      global.window = undefined;
    });

    it('should return confirmation details', () => {
      const cart = {
        account: { email: 'test@swell.is' },
        billing: {
          name: 'Test Person-us',
          phone: '3106683312',
          city: 'Beverly Hills',
          country: 'US',
          address1: 'Lombard St 10',
          address2: 'Apt 214',
          zip: '90210',
          state: 'CA',
        },
      };
      const result = getKlarnaConfirmationDetails(cart);

      expect(result).toEqual({
        payment_method: {
          billing_details: {
            address: {
              city: 'Beverly Hills',
              country: 'US',
              line1: 'Lombard St 10',
              line2: 'Apt 214',
              postal_code: '90210',
              state: 'CA',
            },
            email: 'test@swell.is',
            name: 'Test Person-us',
            phone: '3106683312',
          },
        },
        return_url: 'http://test.swell.test/checkout?gateway=stripe',
      });
    });
  });

  describe('#getPaymentRequestData', () => {
    let cart = {};
    let params = {};

    beforeEach(() => {
      cart = {
        currency: 'USD',
        capture_total: 15,
        tax_included_total: 4,
        shipment_total: 3,
        shipping: {
          price: 3,
          service_name: 'standard',
        },
        items: [
          {
            product: {
              name: 'Test product',
            },
            price_total: 10,
            discount_total: 2,
          },
        ],
        shipment_rating: {
          services: [
            {
              id: 'standard',
              name: 'Standard',
              description: 'Standard service',
              price: 3,
            },
          ],
        },
        settings: {
          country: 'CA',
          name: 'Test store',
        },
      };

      params = {
        require: {
          shipping: true,
        },
      };
    });

    it('should return payment request data', () => {
      const result = getPaymentRequestData(cart, params);

      expect(result).toEqual({
        country: 'CA',
        currency: 'usd',
        total: { label: 'Test store', amount: 1500, pending: true },
        displayItems: [
          { label: 'Test product', amount: 800 },
          { label: 'Taxes', amount: 400 },
          { label: 'standard', amount: 300 },
        ],
        shippingOptions: [
          {
            id: 'standard',
            label: 'Standard',
            detail: 'Standard service',
            amount: 300,
          },
        ],
      });
    });
  });
});
