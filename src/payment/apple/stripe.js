import Payment from '../payment';
import { getPaymentRequestData } from '../../utils/stripe';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

/** @typedef {import('@stripe/stripe-js').Stripe} Stripe */
/** @typedef {import('@stripe/stripe-js').PaymentRequestPaymentMethodEvent} PaymentRequestPaymentMethodEvent */

export default class StripeApplePayment extends Payment {
  constructor(request, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    const method = {
      ...methods.apple,
      publishable_key: methods.card.publishable_key,
    };

    super(request, options, params, method);
  }

  get scripts() {
    return ['stripe-js'];
  }

  /** @returns {Stripe} */
  get stripe() {
    if (!StripeApplePayment.stripe) {
      if (window.Stripe) {
        this.stripe = window.Stripe(this.method.publishable_key);
      }

      if (!StripeApplePayment.stripe) {
        throw new LibraryNotLoadedError('Stripe');
      }
    }

    return StripeApplePayment.stripe;
  }

  /** @param {Stripe} stripe */
  set stripe(stripe) {
    StripeApplePayment.stripe = stripe;
  }

  async createElements(cart) {
    const {
      elementId = 'applepay-button',
      style: { type = 'default', theme = 'dark', height = '40px' } = {},
      classes = {},
    } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);
    await this._authorizeDomain();

    const paymentRequest = this._createPaymentRequest(cart);
    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment || !canMakePayment.applePay) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    this.element = this.stripe.elements().create('paymentRequestButton', {
      paymentRequest,
      style: {
        paymentRequestButton: {
          type,
          theme,
          height,
        },
      },
      classes,
    });
  }

  mountElements() {
    this.element.mount(`#${this.elementContainer.id}`);
  }

  async _authorizeDomain() {
    const domain = window.location.hostname;
    const authorization = await this.authorizeGateway({
      gateway: 'stripe',
      params: {
        applepay_domain: domain,
      },
    });

    if (!authorization) {
      throw new Error(`${domain} domain is not verified`);
    }
  }

  _createPaymentRequest(cart) {
    const { require: { name, email, shipping, phone } = {} } = this.params;

    const paymentRequest = this.stripe.paymentRequest({
      requestPayerName: Boolean(name),
      requestPayerEmail: Boolean(email),
      requestPayerPhone: Boolean(phone),
      requestShipping: Boolean(shipping),
      disableWallets: ['googlePay', 'browserCard', 'link'],
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

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingAddressEvent} event */
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

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingOptionEvent} event */
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

  /** @param {PaymentRequestPaymentMethodEvent} event */
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

  /** @param {import('@stripe/stripe-js').PaymentRequestShippingAddress} [address] */
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

  /** @param {PaymentRequestPaymentMethodEvent['paymentMethod']['billing_details']} [address] */
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
