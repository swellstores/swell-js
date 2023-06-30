import Payment from '../payment';
import { get } from '../../utils';
import {
  LibraryNotLoadedError,
  MethodPropertyMissingError,
  UnableAuthenticatePaymentMethodError,
} from '../../utils/errors';

export default class AmazonDirectPayment extends Payment {
  constructor(request, options, params, methods) {
    super(request, options, params, methods.amazon);
  }

  get scripts() {
    return ['amazon-checkout'];
  }

  get amazon() {
    if (!window.amazon) {
      throw new LibraryNotLoadedError('Amazon');
    }

    return window.amazon;
  }

  get merchantId() {
    const merchantId = this.method.merchant_id;

    if (!merchantId) {
      throw new MethodPropertyMissingError('Amazon', 'merchant_id');
    }

    return merchantId;
  }

  get publicKeyId() {
    const publicKeyId = this.method.public_key_id;

    if (!publicKeyId) {
      throw new MethodPropertyMissingError('Amazon', 'public_key_id');
    }

    return publicKeyId;
  }

  get returnUrl() {
    return `${
      window.location.origin + window.location.pathname
    }?gateway=amazon`;
  }

  async createElements() {
    const {
      elementId = 'amazonpay-button',
      locale = 'en_US',
      placement = 'Checkout',
      style: { color = 'Gold' } = {},
      require: { shipping: requireShipping } = {},
    } = this.params;

    this.setElementContainer(elementId);

    const cart = await this.getCart();
    const session = await this._createSession(cart);

    await this.loadScripts(this.scripts);

    this.element = {
      ledgerCurrency: cart.currency,
      checkoutLanguage: locale,
      productType: Boolean(requireShipping) ? 'PayAndShip' : 'PayOnly',
      buttonColor: color,
      placement,
      merchantId: this.merchantId,
      publicKeyId: this.publicKeyId,
      createCheckoutSessionConfig: {
        payloadJSON: session.payload,
        signature: session.signature,
      },
    };
  }

  mountElements() {
    const { classes = {} } = this.params;
    const container = this.elementContainer;
    const amazon = this.amazon;

    amazon.Pay.renderButton(`#${container.id}`, this.element);

    if (classes.base) {
      container.classList.add(classes.base);
    }
  }

  async tokenize() {
    const cart = await this.getCart();
    const returnUrl = this.returnUrl;
    const checkoutSessionId = get(cart, 'billing.amazon.checkout_session_id');

    if (!checkoutSessionId) {
      throw new Error(
        'Missing Amazon Pay checkout session ID (billing.amazon.checkout_session_id)',
      );
    }

    const intent = await this.createIntent({
      gateway: 'amazon',
      intent: {
        checkoutSessionId,
        webCheckoutDetails: {
          checkoutResultReturnUrl: `${returnUrl}&confirm=true&redirect_status=succeeded`,
          checkoutCancelUrl: `${returnUrl}&redirect_status=canceled`,
        },
        paymentDetails:
          cart.capture_total > 0
            ? {
                paymentIntent: 'Authorize',
                canHandlePendingAuthorization: true,
                chargeAmount: {
                  amount: cart.capture_total,
                  currencyCode: cart.currency,
                },
              }
            : {
                // Just confirm payment to save payment details when capture total amount is 0.
                // e.g. trial subscription, 100% discount or items.price = 0
                paymentIntent: 'Confirm',
              },
      },
    });

    return window.location.replace(intent.redirect_url);
  }

  async handleRedirect(queryParams) {
    const { redirect_status } = queryParams;

    switch (redirect_status) {
      case 'succeeded':
        return this._handleSuccessfulRedirect(queryParams);
      case 'canceled':
        throw new UnableAuthenticatePaymentMethodError();
      default:
        throw new Error(`Unknown redirect status: ${redirect_status}`);
    }
  }

  _createSession(cart) {
    const returnUrl = this.returnUrl;
    const isSubscription = Boolean(cart.subscription_delivery);

    return this.authorizeGateway({
      gateway: 'amazon',
      params: {
        chargePermissionType: isSubscription ? 'Recurring' : 'OneTime',
        ...(isSubscription
          ? {
              recurringMetadata: {
                frequency: {
                  unit: 'Variable',
                  value: '0',
                },
              },
            }
          : {}),
        webCheckoutDetails: {
          checkoutReviewReturnUrl: `${returnUrl}&redirect_status=succeeded`,
          checkoutCancelUrl: `${returnUrl}&redirect_status=canceled`,
        },
      },
    });
  }

  async _handleSuccessfulRedirect(queryParams) {
    const { confirm, amazonCheckoutSessionId } = queryParams;

    if (!confirm) {
      await this.updateCart({
        billing: {
          method: 'amazon',
          amazon: {
            checkout_session_id: amazonCheckoutSessionId,
          },
        },
      });
    }

    this.onSuccess();
  }
}
