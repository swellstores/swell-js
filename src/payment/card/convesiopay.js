import Payment from '../payment';

import { isLiveMode } from '../../utils';
import { LibraryNotLoadedError } from '../../utils/errors';

export default class ConvesioCardPayment extends Payment {
  static convesioPay = null;
  static convesioPayComponent = null;

  constructor(api, options, params, methods) {
    super(api, options, params, methods.card);
  }

  get scripts() {
    return ['convesiopay-js'];
  }

  get convesioPay() {
    if (ConvesioCardPayment.convesioPay === null) {
      if (window.ConvesioPay) {
        this.convesioPay = window.ConvesioPay(this.method.public_key);
      }

      if (!ConvesioCardPayment.convesioPay) {
        throw new LibraryNotLoadedError('ConvesioPay');
      }
    }

    return ConvesioCardPayment.convesioPay;
  }

  set convesioPay(convesioPay) {
    ConvesioCardPayment.convesioPay = convesioPay;
  }

  get convesioPayComponent() {
    return ConvesioCardPayment.convesioPayComponent;
  }

  set convesioPayComponent(convesioPayComponent) {
    ConvesioCardPayment.convesioPayComponent = convesioPayComponent;
  }

  async createElements(cart) {
    await this.loadScripts(this.scripts);

    const component = this.convesioPay.component({
      environment: isLiveMode(this.method.mode) ? 'live' : 'test',
      integration: this.method.integration,
      customerEmail: cart.account?.email,
      express: false,
      disabledPaymentMethods: {
        btcpay: true,
        applePay: true,
        googlePay: true,
      },
    });

    this.convesioPayComponent = component;

    component.mount(
      this.params.elementId ? `#${this.params.elementId}` : '#card-element',
    );
  }

  async tokenize() {
    if (!this.convesioPayComponent) {
      throw new Error('ConvesioPay element is not defined');
    }

    const token = await this.convesioPayComponent.createToken();

    await this.updateCart({
      billing: {
        method: 'card',
        account_card_id: null,
        card: {
          gateway: 'convesiopay',
          token,
          last4: '????',
          brand: null,
          exp_month: null,
          exp_year: null,
        },
        convesiopay: {
          return_url: this.params.returnUrl,
        },
      },
    });

    return this.onSuccess();
  }
}
