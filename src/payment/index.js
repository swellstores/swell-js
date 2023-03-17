import StripeCardPayment from './card/stripe';
import StripeIDealPayment from './ideal/stripe';
import StripeBancontactPayment from './bancontact/stripe';
import StripeKlarnaPayment from './klarna/stripe';
import StripeGooglePayment from './google/stripe';
import StripeApplePayment from './apple/stripe';
import BraintreePaypalPayment from './paypal/braintree';
import BraintreeGooglePayment from './google/braintree';
import BraintreeApplePayment from './apple/braintree';
import QuickpayCardPayment from './card/quickpay';
import PaysafecardDirectPayment from './paysafecard/paysafecard';
import KlarnaDirectPayment from './klarna/klarna';
import PaypalDirectPayment from './paypal/paypal';
import AmazonDirectPayment from './amazon/amazon';
import {
  PaymentMethodDisabledError,
  UnsupportedPaymentMethodError,
} from '../utils/errors';
import settingsApi from '../settings';
import {
  vaultRequest,
  getLocationParams,
  removeUrlParams,
  toSnake,
  toCamel,
} from '../utils';

export default class PaymentController {
  constructor(request, options) {
    this.request = request;
    this.options = options;
  }

  get(id) {
    return this.request('get', '/payments', id);
  }

  async methods() {
    if (this.methodSettings) {
      return this.methodSettings;
    }

    this.methodSettings = await request('get', '/payment/methods');

    return this.methodSettings;
  }

  async createElements(params) {
    this.params = params;

    if (!params) {
      throw new Error('Payment element parameters are not provided');
    }

    this._performPaymentAction('createElements');
  }

  async tokenize(params = this.params) {
    this.params = params;

    if (!this.params) {
      throw new Error('Tokenization parameters are not provided');
    }

    this._performPaymentAction('tokenize');
  }

  async handleRedirect(params = this.params) {
    const queryParams = getLocationParams(window.location);

    if (!queryParams || !queryParams.gateway) {
      return;
    }

    this.params = params;

    if (!params) {
      throw new Error('Redirect parameters are not provided');
    }

    removeUrlParams();
    this._performPaymentAction('handleRedirect', queryParams);
  }

  async authenticate(id) {
    try {
      const payment = await this.get(id);

      if (!payment) {
        throw new Error('Payment not found');
      }

      const { method, gateway } = payment;
      const PaymentClass = this._getPaymentClass(method, gateway);

      if (!PaymentClass) {
        throw new UnsupportedPaymentMethodError(method, gateway);
      }

      const paymentMethods = await this._getPaymentMethods();
      const methodSettings = paymentMethods[method];

      if (!methodSettings) {
        throw new PaymentMethodDisabledError(method);
      }

      const paymentInstance = new PaymentClass(
        this.request,
        this.options,
        null,
        paymentMethods,
      );

      await paymentInstance.loadScripts(paymentInstance.scripts);
      return await paymentInstance.authenticate(payment);
    } catch (error) {
      return { error };
    }
  }

  async createIntent(data) {
    return this._vaultRequest('post', '/intent', data);
  }

  async updateIntent(data) {
    return this._vaultRequest('put', '/intent', data);
  }

  async authorizeGateway(data) {
    return this._vaultRequest('post', '/authorization', data);
  }

  _normalizeParams() {
    if (!this.params) {
      return;
    }

    if (this.params.config) {
      console.warn(
        'Please move the "config" field to the payment method parameters ("card.config" or/and "ideal.config").',
      );

      if (this.params.card) {
        this.params.card.config = this.params.config;
      }

      if (this.params.ideal) {
        this.params.ideal.config = this.params.config;
      }

      delete this.params.config;
    }
  }

  async _getPaymentMethods() {
    const paymentMethods = await settingsApi(
      this.request,
      this.options,
    ).payments();

    if (paymentMethods.error) {
      throw new Error(paymentMethods.error);
    }

    return toSnake(paymentMethods);
  }

  async _vaultRequest(method, url, data) {
    const response = await vaultRequest(method, url, data);

    if (response.errors) {
      const param = Object.keys(response.errors)[0];
      const err = new Error(response.errors[param].message || 'Unknown error');
      err.code = 'vault_error';
      err.status = 402;
      err.param = param;
      throw err;
    }

    if (this.options.useCamelCase) {
      return toCamel(response);
    }

    return response;
  }

  async _performPaymentAction(action, ...args) {
    const paymentMethods = await this._getPaymentMethods();

    this._normalizeParams();

    Object.entries(this.params).forEach(([method, params]) => {
      const methodSettings = paymentMethods[method];

      if (!methodSettings) {
        return console.error(new PaymentMethodDisabledError(method));
      }

      const PaymentClass = this._getPaymentClass(
        method,
        methodSettings.gateway,
      );

      if (!PaymentClass) {
        return console.error(
          new UnsupportedPaymentMethodError(method, methodSettings.gateway),
        );
      }

      try {
        const payment = new PaymentClass(
          this.request,
          this.options,
          params,
          paymentMethods,
        );

        payment
          .loadScripts(payment.scripts)
          .then(payment[action].bind(payment, ...args))
          .catch(payment.onError.bind(payment));
      } catch (error) {
        return console.error(error.message);
      }
    });
  }

  _getPaymentClass(method, gateway) {
    switch (method) {
      case 'card':
        return this._getCardPaymentClass(gateway);
      case 'ideal':
        return this._getIDealPaymentClass(gateway);
      case 'bancontact':
        return this._getBancontactPaymentClass(gateway);
      case 'klarna':
        return this._getKlarnaPaymentClass(gateway);
      case 'paysafecard':
        return this._getPaysafecardPaymentClass(gateway);
      case 'paypal':
        return this._getPaypalPaymentClass(gateway);
      case 'google':
        return this._getGooglePaymentClass(gateway);
      case 'apple':
        return this._getApplePaymentClass(gateway);
      case 'amazon':
        return this._getAmazonPaymentClass(gateway);
      default:
        return null;
    }
  }

  _getCardPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeCardPayment;
      case 'quickpay':
        return QuickpayCardPayment;
      default:
        return null;
    }
  }

  _getIDealPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeIDealPayment;
      default:
        return null;
    }
  }

  _getBancontactPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeBancontactPayment;
      default:
        return null;
    }
  }

  _getKlarnaPaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeKlarnaPayment;
      case 'klarna':
        return KlarnaDirectPayment;
      default:
        return null;
    }
  }

  _getPaysafecardPaymentClass(gateway) {
    switch (gateway) {
      default:
        return PaysafecardDirectPayment;
    }
  }

  _getPaypalPaymentClass(gateway) {
    switch (gateway) {
      case 'braintree':
        return BraintreePaypalPayment;
      default:
        return PaypalDirectPayment;
    }
  }

  _getGooglePaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeGooglePayment;
      case 'braintree':
        return BraintreeGooglePayment;
      default:
        return null;
    }
  }

  _getApplePaymentClass(gateway) {
    switch (gateway) {
      case 'stripe':
        return StripeApplePayment;
      case 'braintree':
        return BraintreeApplePayment;
      default:
        return null;
    }
  }

  _getAmazonPaymentClass(gateway) {
    switch (gateway) {
      default:
        return AmazonDirectPayment;
    }
  }
}
