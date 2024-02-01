import Payment from '../payment';
import { getPaymentRequestData } from '../../utils/stripe';
import {
  LibraryNotLoadedError,
  PaymentMethodDisabledError,
} from '../../utils/errors';

export default class StripeGooglePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.google,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  get stripe() {
    if (!StripeGooglePayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeGooglePayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeGooglePayment.stripe;
  }

  set stripe(stripe) {
    StripeGooglePayment.stripe = stripe;
  }

  async createElements(cart) {
    const { elementId = 'googlepay-button', classes = {} } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

    const paymentRequest = this._createPaymentRequest(cart);
    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment?.googlePay) {
      throw new Error(
        'This device is not capable of making Google Pay payments',
      );
    }

    this.element = this.stripe.elements().create('paymentRequestButton', {
      paymentRequest,
      style: {
        paymentRequestButton: this._getButtonStyles(),
      },
      classes,
    });
  }

  mountElements() {
    this.element.mount(`#${this.elementContainer.id}`);
  }

  _createPaymentRequest(cart) {
    const { require: { name, email, shipping, phone } = {} } = this.params;

    const paymentRequest = this.stripe.paymentRequest({
      requestPayerName: Boolean(name),
      requestPayerEmail: Boolean(email),
      requestPayerPhone: Boolean(phone),
      requestShipping: Boolean(shipping),
      disableWallets: ['applePay', 'browserCard', 'link'],
      ...getPaymentRequestData(cart, this.params),
    });

    paymentRequest.on(
      'shippingaddresschange',
      this._onShippingAddressChange.bind(this),
    );
    paymentRequest.on(
      'shippingoptionchange',
      this._onShippingOptionChange.bind(this),
    );
    paymentRequest.on('paymentmethod', this._onPaymentMethod.bind(this));

    return paymentRequest;
  }

  async _onShippingAddressChange(event) {
    const { shippingAddress, updateWith } = event;
    const shipping = this._mapShippingAddress(shippingAddress);
    const cart = await this.updateCart({
      shipping: { ...shipping, service: null },
      shipment_rating: null,
    });

    if (cart) {
      updateWith({
        status: 'success',
        ...getPaymentRequestData(cart, this.params),
      });
    } else {
      updateWith({ status: 'invalid_shipping_address' });
    }
  }

  async _onShippingOptionChange(event) {
    const { shippingOption, updateWith } = event;
    const cart = await this.updateCart({
      shipping: { service: shippingOption.id },
    });

    if (cart) {
      updateWith({
        status: 'success',
        ...getPaymentRequestData(cart, this.params),
      });
    } else {
      updateWith({ status: 'fail' });
    }
  }

  async _onPaymentMethod(event) {
    const {
      payerEmail,
      paymentMethod: { id: paymentMethod, card, billing_details },
      shippingAddress,
      shippingOption,
      complete,
    } = event;
    const { require: { shipping: requireShipping } = {} } = this.params;

    await this.updateCart({
      account: {
        email: payerEmail,
      },
      ...(requireShipping && {
        shipping: {
          ...this._mapShippingAddress(shippingAddress),
          service: shippingOption.id,
        },
      }),
      billing: {
        ...this._mapBillingAddress(billing_details),
        method: 'card',
        card: {
          gateway: 'stripe',
          token: paymentMethod,
          brand: card.brand,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          last4: card.last4,
          address_check: card.checks.address_line1_check,
          zip_check: card.checks.address_postal_code_check,
          cvc_check: card.checks.cvc_check,
        },
      },
    });

    complete('success');

    this.onSuccess();
  }

  // Provides backward compatibility with Google Pay button options
  // https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions
  _getButtonStyles() {
    let { style: { color = 'dark', type = 'default', height = '45px' } = {} } =
      this.params;

    switch (color) {
      case 'white':
        color = 'light';
        break;
      default:
        color = 'dark';
        break;
    }

    switch (type) {
      case 'buy':
      case 'donate':
        break;
      default:
        type = 'default';
        break;
    }

    return {
      type,
      height,
      theme: color,
    };
  }

  _mapShippingAddress(address = {}) {
    return {
      name: address.recipient,
      address1: address.addressLine[0],
      address2: address.addressLine[1],
      city: address.city,
      state: address.region,
      zip: address.postalCode,
      country: address.country,
      phone: address.phone,
    };
  }

  _mapBillingAddress(address = {}) {
    return {
      name: address.name,
      phone: address.phone,
      address1: address.address.line1,
      address2: address.address.line2,
      city: address.address.city,
      state: address.address.state,
      zip: address.address.postal_code,
      country: address.address.country,
    };
  }
}
