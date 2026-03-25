import Payment from '../payment';

import { isLiveMode } from '../../utils';

import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

import { amountInCents } from '../utils';

import {
  getTotal as getAppleTotal,
  getLineItems as getAppleLineItems,
  convertToSwellAddress,
  onShippingAddressChange,
  onShippingMethodChange,
} from '../apple';

/** @typedef {import('../../../types').Cart} Cart */

export default class ConvesioPayApplePayment extends Payment {
  static convesioPay = null;
  static convesioPayComponent = null;

  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(api, options, params, methods.apple);

    this.convesiopay = methods.card;
  }

  get scripts() {
    return ['convesiopay-js'];
  }

  get convesioPay() {
    if (ConvesioPayApplePayment.convesioPay === null) {
      if (window.ConvesioPay) {
        this.convesioPay = window.ConvesioPay(this.convesiopay.public_key);
      }

      if (!ConvesioPayApplePayment.convesioPay) {
        throw new LibraryNotLoadedError('ConvesioPay');
      }
    }

    return ConvesioPayApplePayment.convesioPay;
  }

  set convesioPay(convesioPay) {
    ConvesioPayApplePayment.convesioPay = convesioPay;
  }

  get convesioPayComponent() {
    return ConvesioPayApplePayment.convesioPayComponent;
  }

  set convesioPayComponent(convesioPayComponent) {
    ConvesioPayApplePayment.convesioPayComponent = convesioPayComponent;
  }

  /**
   * Creates the Apple Pay button element
   *
   * @param {Cart} cart
   */
  async createElements(cart) {
    const { elementId = 'applepay-button' } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

    this.convesioPayComponent = this.convesioPay.component({
      environment: isLiveMode(this.method.mode) ? 'live' : 'test',
      integration: this.convesiopay.integration,
      customerEmail: cart.account?.email,
      express: true,
      disabledPaymentMethods: {
        cards: true,
        btcpay: true,
        googlePay: true,
      },
    });

    // When initiating a payment request,
    // we should not display the shipping cost, as it will be calculated later.
    cart = { ...cart };
    cart.shipment_price = 0;
    cart.shipping = {};

    this.sessionOptions = {
      integration: this.convesiopay.integration,
      returnUrl: this.params.returnUrl,
      amount: amountInCents(cart.currency, cart.capture_total),
      currency: cart.currency,
      shippingMethods: getShippingMethods(cart),
      lineItems: getLineItems(cart),
    };
  }

  /**
   * Mounts the Apple Pay button to the DOM
   */
  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    this.convesioPayComponent.mount(`#${container.id}`);

    if (classes.base) {
      container.classList.add(classes.base);
    }

    this.convesioPayComponent.createApplePaySession({
      ...this.sessionOptions,
      onShippingAddressChange: onShippingAddressChange.bind(this),
      onShippingMethodChange: onShippingMethodChange.bind(this),
      onPaymentMethodChange: async (_paymentMethod) => {
        const currentCart = await this.getCart();

        return {
          newTotal: getAppleTotal(currentCart),
          newLineItems: getAppleLineItems(currentCart),
        };
      },
    });

    this.convesioPayComponent.on('change', async (event) => {
      if (event.type === 'applepay') {
        if (event.isSuccessful) {
          const { token, shippingContact, billingContact } = event;
          const { require: { shipping: requireShipping } = {} } = this.params;

          await this.updateCart({
            account: {
              email: shippingContact.emailAddress,
            },
            billing: {
              method: 'apple',
              account_card_id: null,
              card: null,
              apple: {
                token,
                gateway: 'convesiopay',
              },
              ...convertToSwellAddress(billingContact),
            },
            ...(requireShipping && {
              shipping: convertToSwellAddress(shippingContact),
            }),
          });
        }
      }
    });
  }
}

/**
 * @param {Cart} cart
 * @returns {object[]}
 */
function getLineItems(cart) {
  const { sub_total, shipment_price, discount_total, tax_total, currency } =
    cart;

  /** @type {ApplePayJS.ApplePayLineItem[]} */
  const lineItems = [
    {
      label: 'Subtotal',
      amount: amountInCents(currency, sub_total || 0),
    },
  ];

  if (shipment_price) {
    lineItems.push({
      label: 'Shipping',
      amount: amountInCents(currency, shipment_price),
    });
  }

  if (discount_total) {
    lineItems.push({
      label: 'Discount',
      amount: amountInCents(currency, -discount_total),
    });
  }

  if (tax_total) {
    lineItems.push({
      label: 'Taxes',
      amount: amountInCents(currency, tax_total),
    });
  }

  return lineItems;
}

/**
 * @param {Cart} cart
 * @returns {object[]}
 */
function getShippingMethods(cart) {
  const { shipment_delivery, shipment_rating, currency } = cart;

  if (!shipment_delivery) {
    return [];
  }

  if (!shipment_rating?.services?.length) {
    return [];
  }

  return shipment_rating.services.map((service, index) => ({
    label: service.name || `Shipping ${index + 1}`,
    detail: service.description || '',
    amount: amountInCents(currency, service.price || 0),
    identifier: service.id,
  }));
}
