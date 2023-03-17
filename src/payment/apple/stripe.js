import Payment from '../payment';
import { stripeAmountByCurrency } from '../../utils/stripe';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
  DomElementNotFoundError,
} from '../../utils/errors';

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

  set stripe(stripe) {
    StripeApplePayment.stripe = stripe;
  }

  async createElements() {
    await this._authorizeDomain();

    const cart = await this.getCart();
    const paymentRequest = this._createPaymentRequest(cart);
    const canMakePayment = await paymentRequest.canMakePayment();

    if (!canMakePayment || !canMakePayment.applePay) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    this._renderButton(paymentRequest);
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
      ...this._getPaymentRequestData(cart),
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

  _renderButton(paymentRequest) {
    const {
      elementId = 'applepay-button',
      style: { type = 'default', theme = 'dark', height = '40px' } = {},
      classes = {},
    } = this.params;

    const container = document.getElementById(elementId);

    if (!container) {
      throw new DomElementNotFoundError(elementId);
    }

    const button = this.stripe.elements().create('paymentRequestButton', {
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

    button.mount(`#${elementId}`);
  }

  _getPaymentRequestData(cart) {
    const {
      currency,
      shipping,
      items,
      capture_total,
      shipment_rating,
      shipment_total,
      tax_included_total,
      settings,
    } = cart;

    const stripeCurrency = currency.toLowerCase();
    const displayItems = items.map((item) => ({
      label: item.product.name,
      amount: stripeAmountByCurrency(
        currency,
        item.price_total - item.discount_total,
      ),
    }));

    if (tax_included_total) {
      displayItems.push({
        label: 'Taxes',
        amount: stripeAmountByCurrency(currency, tax_included_total),
      });
    }

    if (shipping.price && shipment_total) {
      displayItems.push({
        label: shipping.service_name,
        amount: stripeAmountByCurrency(currency, shipment_total),
      });
    }

    const services = shipment_rating && shipment_rating.services;
    let shippingOptions;
    if (services) {
      shippingOptions = services.map((service) => ({
        id: service.id,
        label: service.name,
        detail: service.description,
        amount: stripeAmountByCurrency(currency, service.price),
      }));
    }

    return {
      country: settings.country,
      currency: stripeCurrency,
      total: {
        label: settings.name,
        amount: stripeAmountByCurrency(currency, capture_total),
        pending: true,
      },
      displayItems,
      shippingOptions,
    };
  }

  async _onShippingAddressChange(event) {
    const { shippingAddress, updateWith } = event;
    const shipping = this._mapShippingAddress(shippingAddress);
    const cart = await this.updateCart({
      shipping: { ...shipping, service: null },
      shipment_rating: null,
    });

    if (cart) {
      updateWith({ status: 'success', ...this._getPaymentRequestData(cart) });
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
      updateWith({ status: 'success', ...this._getPaymentRequestData(cart) });
    } else {
      updateWith({ status: 'fail' });
    }
  }

  async _onPaymentMethod(event) {
    const {
      payerEmail,
      payerName,
      paymentMethod: { id: paymentMethod, card, billing_details },
      shippingAddress,
      shippingOption,
      complete,
    } = event;
    const { require: { shipping: requireShipping } = {} } = this.params;

    await this.updateCart({
      account: {
        name: payerName,
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
