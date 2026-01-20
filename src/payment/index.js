import Payment from './payment';
import StripeCardPayment from './card/stripe';
import StripeIDealPayment from './ideal/stripe';
import StripeBancontactPayment from './bancontact/stripe';
import StripeKlarnaPayment from './klarna/stripe';
import StripeGooglePayment from './google/stripe';
import StripeApplePayment from './apple/stripe';
import BraintreePaypalPayment from './paypal/braintree';
import BraintreeGooglePayment from './google/braintree';
import BraintreeApplePayment from './apple/braintree';
import AuthorizeNetGooglePayment from './google/authorizenet';
import AuthorizeNetApplePayment from './apple/authorizenet';
import QuickpayCardPayment from './card/quickpay';
import PaysafecardDirectPayment from './paysafecard/paysafecard';
import KlarnaDirectPayment from './klarna/klarna';
import PaypalDirectPayment from './paypal/paypal';
import AmazonDirectPayment from './amazon/amazon';
import SezzleDirectPayment from './sezzle/sezzle';
import { adjustParams, adjustMethodParams } from './utils';
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
  constructor(api, options) {
    this.api = api;
    this.options = options;
    this.payment = new Payment(this.api, this.options);
  }

  get(id) {
    return this.api.request('get', '/payments', id);
  }

  async methods() {
    if (this.methodSettings) {
      return this.methodSettings;
    }

    this.methodSettings = await this.api.request('get', '/payment/methods');

    return this.methodSettings;
  }

  async createElements(params) {
    this.params = params;

    if (!params) {
      throw new Error('Payment element parameters are not provided');
    }

    const paymentInstances = await this._createPaymentInstances();
    const cart = await this.payment.getCart();

    await this._performPaymentAction(
      paymentInstances,
      'createElements',
      cart,
    ).then((paymentInstances) =>
      this._performPaymentAction(paymentInstances, 'mountElements'),
    );
  }

  async tokenize(params = this.params) {
    this.params = params;

    if (!this.params) {
      throw new Error('Tokenization parameters are not provided');
    }

    const paymentInstances = await this._createPaymentInstances();

    await this._performPaymentAction(paymentInstances, 'tokenize');
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

    const paymentInstances = await this._createPaymentInstances();

    await this._performPaymentAction(
      paymentInstances,
      'handleRedirect',
      queryParams,
    );
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
        this.api,
        this.options,
        null,
        paymentMethods,
      );

      await paymentInstance.loadScripts(paymentInstance.scripts);

      const result = await paymentInstance.authenticate(payment);

      return result;
    } catch (error) {
      return { error };
    }
  }

  /**
   * Reset the payment timer to update the payment status faster
   *
   * @param {string} id
   * @returns {Promise<object>}
   */
  resetAsyncPayment(id) {
    return this.payment.resetAsyncPayment(id);
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

  async _getPaymentMethods() {
    const paymentMethods = await settingsApi(this.api, this.options).payments();

    if (paymentMethods.error) {
      throw new Error(paymentMethods.error);
    }

    return toSnake(paymentMethods);
  }

  async _vaultRequest(method, url, data) {
    const response = await vaultRequest(method, url, data);

    if (this.options.useCamelCase) {
      return toCamel(response);
    }

    return response;
  }

  /**
   * @returns {Promise<Payment[]>}
   */
  async _createPaymentInstances() {
    const paymentMethods = await this._getPaymentMethods();
    const params = adjustParams(this.params);

    return Object.entries(params).reduce((acc, [method, params]) => {
      const methodSettings = paymentMethods[method];

      if (!methodSettings) {
        console.error(new PaymentMethodDisabledError(method));

        return acc;
      }

      const PaymentClass = this._getPaymentClass(
        method,
        methodSettings.gateway,
      );

      if (!PaymentClass) {
        console.error(
          new UnsupportedPaymentMethodError(method, methodSettings.gateway),
        );

        return acc;
      }

      const methodParams = adjustMethodParams(params);

      try {
        const paymentInstance = new PaymentClass(
          this.api,
          this.options,
          methodParams,
          paymentMethods,
        );

        acc.push(paymentInstance);
      } catch (error) {
        console.error(error);
      }

      return acc;
    }, []);
  }

  /**
   * @param {Payment[]} paymentInstances
   * @param {string} action
   * @param  {...unknown} args
   * @returns {Promise<Payment[]>}
   */
  async _performPaymentAction(paymentInstances, action, ...args) {
    const actions = paymentInstances.reduce((acc, instance) => {
      const paymentAction = instance[action];

      if (paymentAction) {
        acc.set(instance, paymentAction.call(instance, ...args));
      }

      return acc;
    }, new Map());

    await Promise.allSettled(actions.values());

    const nextPaymentInstances = [];

    for (const [instance, resultPromise] of actions.entries()) {
      try {
        await resultPromise;
        nextPaymentInstances.push(instance);
      } catch (error) {
        instance.onError(error);
      }
    }

    return nextPaymentInstances;
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
      case 'sezzle':
        return this._getSezzlePaymentClass(gateway);
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
      case 'authorizenet':
        return AuthorizeNetGooglePayment;
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
      case 'authorizenet':
        return AuthorizeNetApplePayment;
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

  _getSezzlePaymentClass(gateway) {
    switch (gateway) {
      default:
        return SezzleDirectPayment;
    }
  }
}
