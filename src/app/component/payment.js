import AppComponent from './component';
import { vaultRequest } from '../../utils';

export default class AppPaymentComponent extends AppComponent {
  constructor(app, component, api, options) {
    super(app, component, api, options);
  }

  get #accountId() {
    return this.props.cart?.account_id;
  }

  get #gateway() {
    return `app_${this.app.id}_${this.extension}`;
  }

  render(containerId, props = {}) {
    return super.render(containerId, {
      ...props,
      updateCart: this.updateCart.bind(this),
      getIntent: this.#getIntent.bind(this),
      createIntent: this.#createIntent.bind(this),
    });
  }

  #getIntent(data) {
    return vaultRequest('GET', '/intent', {
      gateway: this.#gateway,
      account_id: this.#accountId,
      intent: data,
    });
  }

  #createIntent(data) {
    return vaultRequest('POST', '/intent', {
      gateway: this.#gateway,
      account_id: this.#accountId,
      intent: data,
    });
  }
}
