import Payment from '../payment';
import { getDiscountLabel } from '../utils';
import { isLiveMode } from '../../utils';
import { LibraryNotLoadedError } from '../../utils/errors';

/** @typedef {import('../../../types').Cart} Cart */
/** @typedef {import('../../../types').Address} Address */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutPayloadOrderAmount
 * @prop {number} amount_in_cents
 * @prop {string} currency
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutPayloadOrderItem
 * @prop {string} name
 * @prop {string} sku
 * @prop {number} quantity
 * @prop {SezzleCheckoutSdkCheckoutPayloadOrderAmount} price
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutPayloadOrderDiscount
 * @prop {string} name
 * @prop {SezzleCheckoutSdkCheckoutPayloadOrderAmount} amount
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutPayloadOrder
 * @prop {'AUTH' | 'CAPTURE'} intent
 * @prop {string} reference_id
 * @prop {string} description
 * @prop {boolean} requires_shipping_info
 * @prop {SezzleCheckoutSdkCheckoutPayloadOrderItem[]} items
 * @prop {SezzleCheckoutSdkCheckoutPayloadOrderDiscount[]} discounts
 * @prop {Record<string, string>} [metadata]
 * @prop {SezzleCheckoutSdkCheckoutPayloadOrderAmount} tax_amount
 * @prop {SezzleCheckoutSdkCheckoutPayloadOrderAmount} order_amount
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutPayloadData
 * @prop {'single-step' | 'multi-step' | 'no-shipping'} express_checkout_type
 * @prop {SezzleCheckoutSdkCheckoutPayloadOrder} order
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutPayload
 * @prop {SezzleCheckoutSdkCheckoutPayloadData} checkout_payload
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutUrl
 * @prop {string} checkout_url
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutShippingAddress
 * @prop {string} uuid
 * @prop {string} name
 * @prop {string} street
 * @prop {string} street2
 * @prop {string} city
 * @prop {string} state
 * @prop {string} postal_code
 * @prop {string} country_code
 * @prop {string} phone
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutShippingError
 * @prop {'merchant_unsupported_shipping_address' | 'merchant_error'} code
 */

/**
 * @typedef {object} SezzleCheckoutSdkCheckoutShippingResult
 * @prop {boolean} ok
 * @prop {SezzleCheckoutSdkCheckoutShippingError} [error]
 */

/**
 * @typedef {object} SezzleCheckoutSdkInit
 * @prop {(event: MouseEvent) => void} onClick
 * @prop {(event: CustomEvent) => void} onComplete
 * @prop {() => void} onCancel
 * @prop {() => void} onFailure
 * @prop {(shippingAddress: SezzleCheckoutSdkCheckoutShippingAddress, orderUuid: string) => Promise<SezzleCheckoutSdkCheckoutShippingResult>} onCalculateAddressRelatedCosts
 */

/**
 * @typedef {object} SezzleCheckoutSdk
 * @prop {(containerId: string) => void} renderSezzleButton
 * @prop {(options: SezzleCheckoutSdkInit) => void} init
 * @prop {(options: SezzleCheckoutSdkCheckoutPayload | SezzleCheckoutSdkCheckoutUrl) => void} startCheckout
 */

/**
 * @typedef {object} SezzleCheckoutOptions
 * @prop {'popup' | 'iframe' | 'redirect'} [mode='popup']
 * @prop {string} publicKey
 * @prop {'live' | 'sandbox'} [apiMode='live']
 * @prop {'v2'} [apiVersion='v2']
 */

/** @typedef {new (options: SezzleCheckoutOptions) => SezzleCheckoutSdk} SezzleCheckout */

const SEZZLE_BUTTON_ID = 'sezzle-smart-button-container';

export default class SezzleDirectPayment extends Payment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods.sezzle);

    /** @type {SezzleCheckoutSdkCheckoutPayload | null} */
    this._paymentRequest = null;
  }

  get scripts() {
    return ['sezzle-sdk'];
  }

  /** @returns {SezzleCheckout} */
  get SezzleCheckout() {
    if (!window.Checkout) {
      throw new LibraryNotLoadedError('Sezzle');
    }

    return window.Checkout;
  }

  /** @returns {SezzleCheckoutSdk} */
  get SezzleSdk() {
    if (!this._sezzleSdk) {
      this._sezzleSdk = new this.SezzleCheckout({
        mode: 'popup',
        publicKey: this.method.public_key,
        apiMode: isLiveMode(this.method.mode) ? 'live' : 'sandbox',
        apiVersion: 'v2',
      });

      if (!this._sezzleSdk) {
        throw new LibraryNotLoadedError('Sezzle sdk client');
      }
    }

    return this._sezzleSdk;
  }

  /**
   * @param {Cart} cart
   * @returns {SezzleCheckoutSdkCheckoutPayload}
   */
  _createPaymentRequest(cart) {
    const {
      settings: { name },
    } = cart;

    const shipmentDelivery = Boolean(cart.shipment_delivery);
    const cartCurrency = getCartCurrency(cart);

    return {
      checkout_payload: {
        express_checkout_type: shipmentDelivery ? 'multi-step' : 'no-shipping',
        order: {
          intent: 'AUTH',
          reference_id: cart.checkout_id,
          description: `${name} #${cart.number}`,
          requires_shipping_info: shipmentDelivery,
          items: getItems(cart),
          discounts: getDiscounts(cart),
          tax_amount: shipmentDelivery
            ? undefined
            : getAmountInCents(cartCurrency, cart.tax_total),
          order_amount: getAmountInCents(cartCurrency, cart.capture_total),
        },
      },
    };
  }

  _createButton() {
    const { style = {} } = this.params;

    if (!style.templateText) {
      style.templateText = '%%logo%%';
    }

    if (!style.borderType) {
      style.borderType = 'square';
    }

    if (!style.width) {
      style.width = '100%';
    }

    if (!style.height) {
      style.height = '45px';
    }

    const button = document.createElement('div');

    for (const attrId of Object.keys(style)) {
      button.setAttribute(attrId, style[attrId]);
    }

    button.setAttribute('id', SEZZLE_BUTTON_ID);
    button.style.textAlign = 'center';

    return button;
  }

  _initSezzleSdk() {
    let shippingServices = [];

    this.SezzleSdk.init({
      onClick: (event) => {
        event.preventDefault();

        this.SezzleSdk.startCheckout(this._paymentRequest);
      },
      onComplete: async (event) => {
        try {
          const { order_uuid } = event.data;

          const details = await this.authorizeGateway({
            gateway: 'sezzle',
            params: {
              action: 'details',
              order_uuid,
            },
          });

          let shippingService = null;

          if (details.service_name) {
            shippingService =
              shippingServices.find(
                (service) => service.name === details.service_name,
              )?.id ?? null;
          }

          await this.updateCart({
            account: details.account,
            shipping: {
              ...details.shipping,
              service: shippingService,
            },
            billing: {
              method: 'sezzle',
              account_card_id: null,
              card: null,
              sezzle: { order_uuid },
              ...details.billing,
            },
          });

          this.onSuccess();
        } catch (err) {
          this.onError(err);
        }
      },
      onCancel(_event) {},
      onFailure: (event) => {
        this.onError(event.data);
      },
      onCalculateAddressRelatedCosts: async (address, orderUuid) => {
        const cart = await this.updateCart({
          shipping: convertToSwellAddress(address),
        });

        if (!cart.shipment_rating?.services?.length) {
          return {
            ok: false,
            error: { code: 'merchant_unsupported_shipping_address' },
          };
        }

        shippingServices = cart.shipment_rating.services;

        const result = await this.authorizeGateway({
          gateway: 'sezzle',
          params: {
            action: 'shipping',
            order_uuid: orderUuid,
            currency_code: cart.currency,
            address_uuid: address.uuid,
            shipping_options: cart.shipment_rating.services.map((service) => ({
              name: service.name,
              description: service.description,
              shipping_amount_in_cents: amountInCents(
                cart.currency,
                service.price || 0,
              ),
              tax_amount_in_cents: amountInCents(
                cart.currency,
                cart.tax_total || 0,
              ),
              final_order_amount_in_cents: amountInCents(
                cart.currency,
                (cart.sub_total || 0) +
                  (cart.tax_total || 0) +
                  (service.price || 0),
              ),
            })),
          },
        });

        if (result?.error) {
          console.error(
            '[Sezzle] Update checkout by order error:',
            result.error,
          );

          return {
            ok: false,
            error: { code: 'merchant_error' },
          };
        }

        return { ok: true };
      },
    });
  }

  /**
   * Creates the Sezzle button element
   *
   * @param {Cart} cart
   */
  async createElements(cart) {
    const { elementId = 'sezzle-button' } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

    this._paymentRequest = this._createPaymentRequest(cart);

    this.element = this._createButton();
  }

  /**
   * Mounts the Sezzle button to the DOM
   */
  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    container.appendChild(this.element);

    this.SezzleSdk.renderSezzleButton(SEZZLE_BUTTON_ID);

    if (classes.base) {
      container.classList.add(classes.base);
    }

    this._initSezzleSdk();
  }
}

/**
 * @param {Cart} cart
 * @returns {string}
 */
function getCartCurrency(cart) {
  const {
    settings: { currency },
  } = cart;

  return cart.currency || currency || 'USD';
}

/**
 * @param {string} currency
 * @param {number} amount
 * @returns {SezzleCheckoutSdkCheckoutPayloadOrderAmount}
 */
function getAmountInCents(currency, amount) {
  return {
    amount_in_cents: amountInCents(currency, amount),
    currency,
  };
}

/**
 * @param {Cart} cart
 * @returns {SezzleCheckoutSdkCheckoutPayloadOrderItem[]}
 */
function getItems(cart) {
  const currency = getCartCurrency(cart);

  /** @type {SezzleCheckoutSdkCheckoutPayloadOrderItem[]} */
  const items = cart.items.map((item, index) => ({
    name: item.product?.name || `Product ${index + 1}`,
    sku: item.product?.sku || `Product SKU ${index + 1}`,
    quantity: item.quantity || 1,
    price: getAmountInCents(currency, item.price || 0),
  }));

  return items;
}

/**
 * @param {Cart} cart
 * @returns {SezzleCheckoutSdkCheckoutPayloadOrderDiscount[]}
 */
function getDiscounts(cart) {
  const currency = getCartCurrency(cart);

  return (cart.discounts || []).map((discount) => ({
    name: getDiscountLabel(discount, cart),
    amount: getAmountInCents(currency, discount.amount || 0),
  }));
}

/**
 * @param {SezzleCheckoutSdkCheckoutShippingAddress} address
 * @returns {Address}
 */
function convertToSwellAddress(address) {
  return {
    name: address.name || null,
    address1: address.street || null,
    address2: address.street2 || null,
    city: address.city || null,
    state: address.state || null,
    zip: address.postal_code || null,
    country: address.country_code || null,
    phone: address.phone || null,
  };
}

/**
 * @param {string} currency
 * @param {number} amount
 * @returns {number}
 */
export function amountInCents(currency, amount) {
  return Math.round(amount * 100);
}
