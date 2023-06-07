import { describePayment } from './utils';
import PaypalDirectPayment from '../../src/payment/paypal/paypal';
import BraintreePaypalPayment from '../../src/payment/paypal/braintree';

describePayment('payment/paypal', (request, options, paymentMock) => {
  let params;
  let methods;

  beforeEach(() => {
    params = {
      elementId: 'custom-paypal-element-id',
      locale: 'de_DE',
      style: {
        layout: 'vertical',
        height: 50,
        color: 'blue',
        shape: 'pill',
        label: 'checkout',
        tagline: true,
      },
      require: {
        shipping: true,
      },
      classes: {
        base: 'test-base-class-name',
      },
    };
    methods = {
      paypal: {
        ppcp: false,
        mode: 'test',
        client_id: 'paypal_client_id',
        merchant_id: 'paypal_merchant_id',
        test_merchant_id: 'test_ppcp_merchant_id',
        live_merchant_id: 'live_ppcp_merchant_id',
        store_owner_email: 'example@email.com',
      },
    };
  });

  describe('PayPal direct', () => {
    describe('#scripts', () => {
      it('should return scripts for PayPal Express', () => {
        const payment = new PaypalDirectPayment(
          request,
          options,
          params,
          methods,
        );

        expect(payment.scripts).toEqual([
          {
            id: 'paypal-sdk',
            params: {
              cart: ['currency'],
              client_id: 'paypal_client_id',
              merchant_id: 'paypal_merchant_id',
            },
          },
        ]);
      });

      it('should return scripts for PayPal Commerce Platform (test mode)', () => {
        methods.paypal.ppcp = true;

        const payment = new PaypalDirectPayment(
          request,
          options,
          params,
          methods,
        );

        expect(payment.scripts).toEqual([
          {
            id: 'paypal-sdk',
            params: {
              cart: ['currency'],
              client_id: 'paypal_client_id',
              merchant_id: 'test_ppcp_merchant_id',
            },
          },
        ]);
      });

      it('should return scripts for PayPal Commerce Platform (live mode)', () => {
        methods.paypal.ppcp = true;
        methods.paypal.mode = 'live';

        const payment = new PaypalDirectPayment(
          request,
          options,
          params,
          methods,
        );

        expect(payment.scripts).toEqual([
          {
            id: 'paypal-sdk',
            params: {
              cart: ['currency'],
              client_id: 'paypal_client_id',
              merchant_id: 'live_ppcp_merchant_id',
            },
          },
        ]);
      });
    });

    describe('#createElements', () => {
      let addClassMock;
      let buttonRenderMock;
      let createOrder;
      let onShippingChange;
      let onApprove;

      beforeEach(() => {
        global.window.paypal = {
          Buttons: jest.fn((params) => {
            buttonRenderMock = jest.fn();

            createOrder = params.createOrder;
            onShippingChange = params.onShippingChange;
            onApprove = params.onApprove;

            return {
              render: buttonRenderMock,
            };
          }),
        };

        global.document = {
          getElementById: jest.fn(() => {
            addClassMock = jest.fn();

            return {
              classList: {
                add: addClassMock,
              },
            };
          }),
        };
      });

      it('should create elements', async () => {
        paymentMock.getCart.mockImplementationOnce(() =>
          Promise.resolve({ capture_total: 10 }),
        );

        const payment = new PaypalDirectPayment(
          request,
          options,
          params,
          methods,
        );

        await payment.createElements();

        expect(window.paypal.Buttons).toHaveBeenCalledWith({
          locale: 'de_DE',
          style: {
            color: 'blue',
            height: 50,
            label: 'checkout',
            layout: 'vertical',
            shape: 'pill',
            tagline: true,
          },
          createOrder: expect.any(Function),
          onShippingChange: expect.any(Function),
          onApprove: expect.any(Function),
          onError: expect.any(Function),
        });
        expect(global.document.getElementById).toHaveBeenCalledWith(
          'custom-paypal-element-id',
        );
        expect(addClassMock).toHaveBeenCalledWith('test-base-class-name');
        expect(buttonRenderMock).toHaveBeenCalledWith(
          '#custom-paypal-element-id',
        );
      });

      it('should create elements with default params', async () => {
        paymentMock.getCart.mockImplementationOnce(() =>
          Promise.resolve({ capture_total: 10 }),
        );

        params = {};

        const payment = new PaypalDirectPayment(
          request,
          options,
          params,
          methods,
        );

        await payment.createElements();

        expect(window.paypal.Buttons).toHaveBeenCalledWith({
          locale: 'en_US',
          style: {
            color: 'gold',
            height: 45,
            label: 'paypal',
            layout: 'horizontal',
            shape: 'rect',
            tagline: false,
          },
          createOrder: expect.any(Function),
          onShippingChange: expect.any(Function),
          onApprove: expect.any(Function),
          onError: expect.any(Function),
        });
        expect(global.document.getElementById).toHaveBeenCalledWith(
          'paypal-button',
        );
        expect(buttonRenderMock).toHaveBeenCalledWith('#paypal-button');
      });

      describe('#_createOrder', () => {
        it('should create order for PayPal Express', async () => {
          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({ currency: 'EUR', capture_total: 10 }),
          );

          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();

          createOrder();

          expect(paymentMock.createIntent).toHaveBeenCalledWith({
            gateway: 'paypal',
            intent: {
              application_context: { shipping_preference: 'GET_FROM_FILE' },
              intent: 'AUTHORIZE',
              purchase_units: [
                {
                  amount: { value: 10, currency_code: 'EUR' },
                  payee: { merchant_id: 'paypal_merchant_id' },
                },
              ],
            },
          });
        });

        it('should create order when shipping is not required', async () => {
          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({ currency: 'EUR', capture_total: 10 }),
          );

          params.require.shipping = false;

          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();

          createOrder();

          expect(paymentMock.createIntent).toHaveBeenCalledWith({
            gateway: 'paypal',
            intent: {
              intent: 'AUTHORIZE',
              application_context: { shipping_preference: 'NO_SHIPPING' },
              purchase_units: [
                {
                  amount: { currency_code: 'EUR', value: 10 },
                  payee: { merchant_id: 'paypal_merchant_id' },
                },
              ],
            },
          });
        });

        it('should create order for PayPal Progressive Checkout', async () => {
          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({ currency: 'EUR', capture_total: 10 }),
          );

          methods.paypal.merchant_id = null;

          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();

          createOrder();

          expect(paymentMock.createIntent).toHaveBeenCalledWith({
            gateway: 'paypal',
            intent: {
              intent: 'CAPTURE',
              application_context: { shipping_preference: 'GET_FROM_FILE' },
              purchase_units: [
                {
                  amount: { currency_code: 'EUR', value: 10 },
                  payee: {
                    email_address: 'example@email.com',
                  },
                },
              ],
            },
          });
        });

        it('should create order for PayPal Progressive Checkout with token vaulting', async () => {
          methods.paypal.ppcp = true;
          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({
              currency: 'EUR',
              capture_total: 10,
              subscription_delivery: true,
            }),
          );

          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();

          createOrder();

          expect(paymentMock.createIntent).toHaveBeenCalledWith({
            gateway: 'paypal',
            intent: {
              intent: 'AUTHORIZE',
              application_context: { shipping_preference: 'GET_FROM_FILE' },
              purchase_units: [
                {
                  amount: { currency_code: 'EUR', value: 10 },
                  payee: {
                    merchant_id: 'test_ppcp_merchant_id',
                  },
                },
              ],
              payment_source: {
                paypal: {
                  attributes: {
                    vault: {
                      store_in_vault: 'ON_SUCCESS',
                      usage_type: 'MERCHANT',
                    },
                  },
                  experience_context: {
                    cancel_url:
                      'http://test.swell.test/checkout?gateway=paypal&redirect_status=canceled',
                    return_url:
                      'http://test.swell.test/checkout?gateway=paypal&redirect_status=succeeded',
                  },
                },
              },
            },
          });
        });

        it('should throw an error when the cart has subscription delivery and ppсp is disabled', async () => {
          methods.paypal.ppcp = false;
          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({
              currency: 'EUR',
              capture_total: 10,
              subscription_delivery: true,
            }),
          );

          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await expect(payment.createElements()).rejects.toThrow(
            'Subscriptions are only supported by PayPal Commerce Platform. See Payment settings in the Swell dashboard to enable PayPal Commerce Platform',
          );
        });
      });

      describe('#_onShippingChange', () => {
        let data;
        const actions = {
          reject: jest.fn(),
        };

        beforeEach(() => {
          data = {
            orderID: 'paypal_order_id',
            shipping_address: {
              state: 'CA',
              city: 'San Jose',
              postal_code: '95131',
              country_code: 'US',
            },
            selected_shipping_option: {
              id: 'express',
            },
          };

          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({
              currency: 'EUR',
              capture_total: 10,
            }),
          );

          paymentMock.updateCart.mockImplementation((updateData) => {
            if (
              updateData.shipping &&
              (!updateData.shipping.country ||
                updateData.shipping.country === 'US')
            ) {
              return {
                id: 'test_cart_id',
                currency: 'EUR',
                capture_total: 21.87,
                sub_total: 15,
                shipment_total: 5,
                tax_included_total: 1.87,
                discount_total: 0,
                shipment_rating: {
                  date_created: '2022-11-23T14:52:17.875Z',
                  fingerprint: '1e618daf6a7bc08a86f3d609ec6e9c6c',
                  services: [
                    {
                      id: 'standard',
                      name: 'Standard Shipping',
                      price: 5,
                      description: 'Standard shipping service',
                    },
                    {
                      id: 'express',
                      name: 'Express Shipping',
                      price: 15,
                      description: 'Express shipping service',
                    },
                  ],
                },
              };
            }

            return {};
          });
        });

        it('should update cart and patch PayPal order with selected shipping service', async () => {
          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await onShippingChange(data, actions);

          expect(paymentMock.updateCart).toHaveBeenCalledTimes(1);
          expect(paymentMock.updateCart).toHaveBeenCalledWith({
            shipping: {
              city: 'San Jose',
              country: 'US',
              service: 'express',
              state: 'CA',
              zip: '95131',
            },
            shipment_rating: null,
            $taxes: true,
          });
          expect(paymentMock.updateIntent).toHaveBeenCalledWith({
            gateway: 'paypal',
            intent: {
              paypal_order_id: data.orderID,
              cart_id: 'test_cart_id',
            },
          });
        });

        it('should update cart and patch PayPal order with first shipping service when service is not selected', async () => {
          data.selected_shipping_option = null;

          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await onShippingChange(data, actions);

          expect(paymentMock.updateCart).toHaveBeenCalledTimes(2);
          expect(paymentMock.updateCart).toHaveBeenNthCalledWith(1, {
            shipping: {
              city: 'San Jose',
              country: 'US',
              state: 'CA',
              zip: '95131',
            },
            shipment_rating: null,
          });
          expect(paymentMock.updateCart).toHaveBeenNthCalledWith(2, {
            shipping: {
              service: 'standard',
            },
            $taxes: true,
          });
          expect(paymentMock.updateIntent).toHaveBeenCalledWith({
            gateway: 'paypal',
            intent: {
              paypal_order_id: data.orderID,
              cart_id: 'test_cart_id',
            },
          });
        });

        it('should reject PayPal order update when no shipping services are available', async () => {
          data.shipping_address.country_code = 'CA';

          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await onShippingChange(data, actions);

          expect(actions.reject).toHaveBeenCalled();
        });
      });

      describe('#_onApprove', () => {
        const data = null;
        const actions = {
          order: {
            get: jest.fn(() => ({
              id: '8XU46699TN101191A',
              payer: {
                name: {
                  given_name: 'Jessie',
                  surname: 'Rose',
                },
                email_address: 'jessie@gmail.com',
                payer_id: 'WAG9UEQLWA5ZY',
                address: {
                  address_line_1: '499 Point Street',
                  admin_area_2: 'Grand Forks',
                  admin_area_1: 'ND',
                  postal_code: '58203',
                  country_code: 'US',
                },
              },
              purchase_units: [
                {
                  shipping: {
                    name: {
                      full_name: 'Jessie Rose',
                    },
                    address: {
                      address_line_1: '1 Main St',
                      admin_area_2: 'San Jose',
                      admin_area_1: 'CA',
                      postal_code: '95131',
                      country_code: 'US',
                    },
                  },
                },
              ],
            })),
          },
        };

        beforeEach(() => {
          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({ currency: 'EUR', capture_total: 10 }),
          );
        });

        it('should update cart with PayPal order details', async () => {
          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await onApprove(data, actions);

          expect(paymentMock.updateCart).toHaveBeenCalledWith({
            account: { email: 'jessie@gmail.com' },
            billing: {
              address1: '499 Point Street',
              address2: undefined,
              city: 'Grand Forks',
              country: 'US',
              method: 'paypal',
              name: 'Jessie Rose',
              paypal: { order_id: '8XU46699TN101191A' },
              state: 'ND',
              zip: '58203',
            },
            shipping: {
              address1: '1 Main St',
              address2: undefined,
              city: 'San Jose',
              country: 'US',
              first_name: 'Jessie',
              last_name: 'Rose',
              name: 'Jessie Rose',
              state: 'CA',
              zip: '95131',
            },
          });
          expect(paymentMock.onSuccess).toHaveBeenCalled();
        });

        it('should update cart with PayPal order details without shipping when shipping is not required', async () => {
          params.require.shipping = false;

          const payment = new PaypalDirectPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await onApprove(data, actions);

          expect(paymentMock.updateCart).toHaveBeenCalledWith({
            account: { email: 'jessie@gmail.com' },
            billing: {
              address1: '499 Point Street',
              address2: undefined,
              city: 'Grand Forks',
              country: 'US',
              method: 'paypal',
              name: 'Jessie Rose',
              paypal: { order_id: '8XU46699TN101191A' },
              state: 'ND',
              zip: '58203',
            },
          });
          expect(paymentMock.onSuccess).toHaveBeenCalled();
        });
      });
    });
  });

  describe('PayPal via Braintee', () => {
    describe('#scripts', () => {
      it('should return scripts for PayPal Express', () => {
        const payment = new BraintreePaypalPayment(
          request,
          options,
          params,
          methods,
        );

        expect(payment.scripts).toEqual([
          {
            id: 'braintree-paypal-sdk',
            params: {
              cart: ['currency'],
              client_id: 'paypal_client_id',
              merchant_id: 'paypal_merchant_id',
            },
          },
          'braintree-web',
          'braintree-web-paypal-checkout',
        ]);
      });
    });

    describe('#createElements', () => {
      let addClassMock;
      let buttonRenderMock;
      let createPaymentMock;
      let createBillingAgreement;
      let onApprove;

      beforeEach(() => {
        global.window.paypal = {
          FUNDING: {
            PAYPAL: 'paypal',
          },
          Buttons: jest.fn((params) => {
            buttonRenderMock = jest.fn();

            createBillingAgreement = params.createBillingAgreement;
            onApprove = params.onApprove;

            return {
              render: buttonRenderMock,
            };
          }),
        };

        global.window.braintree = {
          client: {
            create: jest.fn((params) => params),
          },
          paypalCheckout: {
            create: jest.fn(() => {
              createPaymentMock = jest.fn();

              return {
                createPayment: createPaymentMock,
                tokenizePayment: (data) => Promise.resolve(data),
              };
            }),
          },
        };

        global.document = {
          getElementById: jest.fn(() => {
            addClassMock = jest.fn();

            return {
              classList: {
                add: addClassMock,
              },
            };
          }),
        };
      });

      it('should create elements', async () => {
        const payment = new BraintreePaypalPayment(
          request,
          options,
          params,
          methods,
        );

        await payment.createElements();

        expect(window.paypal.Buttons).toHaveBeenCalledWith({
          fundingSource: 'paypal',
          locale: 'de_DE',
          style: {
            color: 'blue',
            height: 50,
            label: 'checkout',
            layout: 'vertical',
            shape: 'pill',
            tagline: true,
          },
          createBillingAgreement: expect.any(Function),
          onApprove: expect.any(Function),
          onCancel: expect.any(Function),
          onError: expect.any(Function),
        });
        expect(global.document.getElementById).toHaveBeenCalledWith(
          'custom-paypal-element-id',
        );
        expect(addClassMock).toHaveBeenCalledWith('test-base-class-name');
        expect(buttonRenderMock).toHaveBeenCalledWith(
          '#custom-paypal-element-id',
        );
        expect(paymentMock.authorizeGateway).toHaveBeenCalledWith({
          gateway: 'braintree',
        });
        expect(window.braintree.client.create).toHaveBeenCalledWith({
          authorization: 'braintree_authorization',
        });
        expect(window.braintree.paypalCheckout.create).toHaveBeenCalledWith({
          client: { authorization: 'braintree_authorization' },
        });
      });

      it('should create elements with default params', async () => {
        params = {};

        const payment = new BraintreePaypalPayment(
          request,
          options,
          params,
          methods,
        );

        await payment.createElements();

        expect(window.paypal.Buttons).toHaveBeenCalledWith({
          fundingSource: 'paypal',
          locale: 'en_US',
          style: {
            color: 'gold',
            height: 45,
            label: 'paypal',
            layout: 'horizontal',
            shape: 'rect',
            tagline: false,
          },
          createBillingAgreement: expect.any(Function),
          onApprove: expect.any(Function),
          onCancel: expect.any(Function),
          onError: expect.any(Function),
        });
        expect(global.document.getElementById).toHaveBeenCalledWith(
          'paypal-button',
        );
        expect(buttonRenderMock).toHaveBeenCalledWith('#paypal-button');
        expect(paymentMock.authorizeGateway).toHaveBeenCalledWith({
          gateway: 'braintree',
        });
        expect(window.braintree.client.create).toHaveBeenCalledWith({
          authorization: 'braintree_authorization',
        });
        expect(window.braintree.paypalCheckout.create).toHaveBeenCalledWith({
          client: { authorization: 'braintree_authorization' },
        });
      });

      describe('#_createBillingAgreement', () => {
        it('should create PayPal billing agreement', async () => {
          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({ currency: 'EUR', capture_total: 10 }),
          );

          const payment = new BraintreePaypalPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await createBillingAgreement();

          expect(createPaymentMock).toHaveBeenCalledWith({
            flow: 'vault',
            amount: 10,
            currency: 'EUR',
            enableShippingAddress: true,
            requestBillingAgreement: true,
          });
        });

        it('should create PayPal billing agreement when shipping is not required', async () => {
          paymentMock.getCart.mockImplementationOnce(() =>
            Promise.resolve({ currency: 'EUR', capture_total: 10 }),
          );

          params.require.shipping = false;

          const payment = new BraintreePaypalPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await createBillingAgreement();

          expect(createPaymentMock).toHaveBeenCalledWith({
            flow: 'vault',
            amount: 10,
            currency: 'EUR',
            enableShippingAddress: false,
            requestBillingAgreement: true,
          });
        });
      });

      describe('#_onApprove', () => {
        const actions = null;
        const data = {
          nonce: 'braintee_nonce',
          details: {
            email: 'jessie@gmail.com',
            countryCode: 'US',
            firstName: 'Jessie',
            lastName: 'Rose',
            shippingAddress: {
              recipientName: 'Jessie Rose',
              line1: '1 Main St',
              state: 'CA',
              city: 'San Jose',
              postalCode: '95131',
              countryCode: 'US',
            },
          },
        };

        it('should update cart with PayPal order details', async () => {
          const payment = new BraintreePaypalPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await onApprove(data, actions);

          expect(paymentMock.updateCart).toHaveBeenCalledWith({
            account: { email: 'jessie@gmail.com' },
            billing: {
              country: 'US',
              first_name: 'Jessie',
              last_name: 'Rose',
              method: 'paypal',
              name: 'Jessie Rose',
              paypal: { nonce: 'braintee_nonce' },
            },
            shipping: {
              address1: '1 Main St',
              address2: undefined,
              city: 'San Jose',
              country: 'US',
              name: 'Jessie Rose',
              state: 'CA',
              zip: '95131',
            },
          });
          expect(paymentMock.onSuccess).toHaveBeenCalled();
        });

        it('should update cart with PayPal order details without shipping when shipping is not required', async () => {
          params.require.shipping = false;

          const payment = new BraintreePaypalPayment(
            request,
            options,
            params,
            methods,
          );

          await payment.createElements();
          await onApprove(data, actions);

          expect(paymentMock.updateCart).toHaveBeenCalledWith({
            account: { email: 'jessie@gmail.com' },
            billing: {
              country: 'US',
              first_name: 'Jessie',
              last_name: 'Rose',
              method: 'paypal',
              name: 'Jessie Rose',
              paypal: { nonce: 'braintee_nonce' },
            },
          });
          expect(paymentMock.onSuccess).toHaveBeenCalled();
        });
      });
    });
  });
});
