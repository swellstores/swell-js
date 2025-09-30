/**
 * Apple Pay Payment Integration for Authorize.Net Gateway
 *
 * This implementation integrates Apple Pay with Swell using Authorize.Net as the payment processor.
 *
 * KEY IMPLEMENTATION DETAILS:
 *
 * 1. SHIPPING ADDRESS HANDLING:
 *    - Apple Pay is the ONLY source of shipping address
 *    - Any pre-existing shipping data from checkout forms is cleared before initialization
 *    - When Apple Pay sheet opens, it immediately fires 'shippingcontactselected' with default address
 *    - Each address change triggers recalculation of shipping options and tax
 *
 * 2. PAYMENT FLOW:
 *    - User clicks Apple Pay button → Sheet opens
 *    - User confirms address/shipping → Calculations update in real-time
 *    - User authorizes with Face ID/Touch ID → Payment token stored in cart
 *    - User must manually click "Place Order" to submit (no auto-processing)
 *
 * 3. CRITICAL FIXES APPLIED:
 *    - Optional chaining on addressLines (can be undefined during privacy mode)
 *    - Country codes uppercased (Apple sends lowercase, Swell needs uppercase)
 *    - All amounts formatted as strings with 2 decimals
 *    - newShippingMethods always provided (even as [] in errors)
 *    - Container clearing logic to prevent duplicate buttons with multiple gateways
 *
 * 4. TOTAL DISPLAY:
 *    - Shows "Amount Pending" until shipping method selected
 *    - Shows actual amount after shipping selected (type: 'pending' → 'final')
 *
 * @see https://developer.apple.com/documentation/applepayontheweb/apple-pay-js-api
 */

import Payment from '../payment';
import {
  getTotal,
  getLineItems,
  convertToSwellAddress,
  createError,
  getErrorMessage,
  onCouponCodeChanged,
  onShippingMethodSelected,
  onShippingContactSelected,
} from '../apple';
import { base64Encode } from '../../utils';
import {
  PaymentMethodDisabledError,
  LibraryNotLoadedError,
} from '../../utils/errors';

const VERSION = 14;

const MERCHANT_CAPABILITIES = Object.freeze([
  'supports3DS',
  'supportsDebit',
  'supportsCredit',
]);

const ALLOWED_CARD_NETWORKS = Object.freeze([
  'amex',
  'discover',
  'interac',
  'jcb',
  'masterCard',
  'visa',
]);

export default class AuthorizeNetApplePayment extends Payment {
  constructor(api, options, params, methods) {
    if (!methods.card) {
      throw new PaymentMethodDisabledError('Credit cards');
    }

    super(api, options, params, methods.apple);
  }

  get scripts() {
    return ['apple-pay'];
  }

  /** @returns {typeof ApplePaySession} */
  get ApplePaySession() {
    if (!window.ApplePaySession) {
      throw new LibraryNotLoadedError('Apple');
    }

    return window.ApplePaySession;
  }

  /**
   * Creates the Apple Pay payment request object
   *
   * IMPORTANT: countryCode here is the MERCHANT's country (where your business is located),
   * NOT the customer's country. Customer country comes from shippingContact.countryCode.
   *
   * NOTE: We do NOT pass shippingMethods in the initial request. Shipping methods
   * are provided dynamically after the user selects/confirms their address in the
   * 'shippingcontactselected' event handler.
   *
   * @returns {ApplePayJS.ApplePayPaymentRequest}
   */
  _createPaymentRequest(cart) {
    const { require = {} } = this.params;
    const {
      settings: { country },
      currency,
    } = cart;

    const requiredShippingContactFields = [];
    const requiredBillingContactFields = ['postalAddress'];

    if (require.name) {
      requiredShippingContactFields.push('name');
    }

    if (require.email) {
      requiredShippingContactFields.push('email');
    }

    if (require.phone) {
      requiredShippingContactFields.push('phone');
    }

    if (require.shipping) {
      requiredShippingContactFields.push('postalAddress');
    }

    return {
      total: getTotal(cart),
      countryCode: country, // Merchant's country
      currencyCode: currency,
      supportedNetworks: ALLOWED_CARD_NETWORKS,
      merchantCapabilities: MERCHANT_CAPABILITIES,
      requiredShippingContactFields,
      requiredBillingContactFields,
      supportsCouponCode: true,
      lineItems: getLineItems(cart),
    };
  }

  /**
   * Creates and configures the Apple Pay session with all event handlers
   *
   * Event handlers:
   * - validatemerchant: Validates with Authorize.Net to authorize this domain
   * - shippingcontactselected: Updates cart when user selects/changes address
   * - shippingmethodselected: Updates cart when user selects shipping method
   * - couponcodechanged: Applies/removes coupon codes
   * - paymentauthorized: Stores payment token and prepares cart for submission
   *
   * @param {ApplePayJS.ApplePayPaymentRequest} paymentRequest
   */
  _createPaymentSession(paymentRequest) {
    const session = new this.ApplePaySession(VERSION, paymentRequest);

    // VALIDATEMERCHANT: Required to authorize this domain with Apple Pay
    session.onvalidatemerchant = async (event) => {
      const merchantSession = await this.authorizeGateway({
        gateway: 'authorizenet',
        params: {
          method: 'apple',
          merchantIdentifier: this.method.merchant_id,
          validationURL: event.validationURL,
          displayName: paymentRequest.total.label,
          domainName: window.location.hostname,
        },
      });

      if (merchantSession.error) {
        console.error(
          '[Apple Pay] Merchant validation error:',
          merchantSession.error,
        );
        session.abort();
        return;
      }

      if (merchantSession) {
        session.completeMerchantValidation(merchantSession);
      } else {
        session.abort();
      }
    };

    session.onshippingcontactselected = onShippingContactSelected.bind(
      this,
      session,
    );

    session.onshippingmethodselected = onShippingMethodSelected.bind(
      this,
      session,
    );

    session.oncouponcodechanged = onCouponCodeChanged.bind(this, session);

    // PAYMENTAUTHORIZED: User confirmed payment with Face ID/Touch ID
    // This is where we store the payment token in the cart
    session.onpaymentauthorized = async (event) => {
      const {
        payment: { token, shippingContact, billingContact },
      } = event;
      const { require: { shipping: requireShipping } = {} } = this.params;

      // CRITICAL: Apple Pay addresses are the ONLY addresses we use
      // - shippingContact: For shipping address (already validated in shippingcontactselected)
      // - billingContact: For billing address (can be different from shipping)
      // - email: From shippingContact.emailAddress
      //
      // We store the payment token but DO NOT process the order yet.
      // The user must manually click "Place Order" to complete the transaction.
      const cart = await this.updateCart({
        account: {
          email: shippingContact.emailAddress,
        },
        billing: {
          method: 'apple',
          account_card_id: null,
          card: null,
          apple: {
            token: base64Encode(JSON.stringify(token.paymentData)),
            gateway: 'authorizenet',
          },
          ...convertToSwellAddress(billingContact),
        },
        ...(requireShipping && {
          shipping: convertToSwellAddress(shippingContact),
        }),
      });

      if (cart.errors) {
        return session.completePayment({
          status: this.ApplePaySession.STATUS_FAILURE,
          errors: createError('unknown', getErrorMessage(cart.errors)),
        });
      }

      // Complete Apple Pay session successfully
      // This closes the Apple Pay sheet and shows success to the user
      session.completePayment({
        status: this.ApplePaySession.STATUS_SUCCESS,
      });

      // Notify that Apple Pay authorization is complete
      // The cart now has the payment token and is ready for submission
      // NOTE: This does NOT submit the order - user must click "Place Order"
      this.onSuccess(cart);
    };

    session.begin();
  }

  /** @param {ApplePayJS.ApplePayPaymentRequest} paymentRequest */
  _createButton(paymentRequest) {
    const { style: { type = 'plain', theme = 'black', height = '40px' } = {} } =
      this.params;

    const button = document.createElement('apple-pay-button');

    button.setAttribute('buttonstyle', theme);
    button.setAttribute('type', type);
    button.style.setProperty('--apple-pay-button-width', '100%');
    button.style.setProperty('--apple-pay-button-height', height);

    button.addEventListener(
      'click',
      this._createPaymentSession.bind(this, paymentRequest),
    );

    return button;
  }

  /**
   * Creates the Apple Pay button element
   *
   * IMPORTANT: The cart passed in should have shipping address cleared.
   * This ensures Apple Pay doesn't use pre-existing shipping data from
   * checkout forms. The calling code (ApplePayButton.svelte) should clear
   * the shipping address before calling this method.
   *
   * The button is created but NOT clicked yet. When clicked, it will:
   * 1. Create a new Apple Pay session
   * 2. Open the Apple Pay sheet
   * 3. Handle all payment events (address selection, authorization, etc.)
   *
   * @param {Cart} cart - Should have shipping fields set to null
   */
  async createElements(cart) {
    const { elementId = 'applepay-button' } = this.params;

    this.setElementContainer(elementId);
    await this.loadScripts(this.scripts);

    if (!this.ApplePaySession.canMakePayments()) {
      throw new Error(
        'This device is not capable of making Apple Pay payments',
      );
    }

    // Cart should already be cleaned by the calling code
    // Don't fetch it again to avoid timing issues
    const paymentRequest = this._createPaymentRequest(cart);

    this.element = this._createButton(paymentRequest);
  }

  /**
   * Mounts the Apple Pay button to the DOM
   */
  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;

    container.appendChild(this.element);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }
}
