import cartApi from '../../cart';
import { isObject, isFunction, loadScript } from '../../utils';

export default class AppComponent {
  #preact = null;
  #preactComponent = null;
  #container = null;

  constructor(app, component, api, options) {
    this.app = app;
    this.component = component;
    this.api = api;
    this.options = options;
    this.props = {};
  }

  get id() {
    return this.component.id;
  }

  get name() {
    return this.component.name;
  }

  get extension() {
    return this.component.values.extension;
  }

  get settings() {
    return this.app.settings[this.extension];
  }

  get #fileData() {
    return this.component.build_file_data;
  }

  render(containerId, props) {
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(`Container with ID "${containerId}" not found.`);
    }

    const evalFn = new Function(`${this.#fileData}\nreturn { ...Component }`);
    const { preact, default: Component } = evalFn();

    this.#preact = preact;
    this.#preactComponent = Component;
    this.#container = container;

    return new Promise((resolve) => {
      this.#render({
        ...props,
        settings: this.settings,
        registerHandlers: this.#registerHandlers.bind(this),
        loadLib: this.#loadLib.bind(this),
        onReady: resolve,
      });
    });
  }

  setProps(props) {
    this.#render(props);
  }

  async updateCart(data) {
    const cart = await cartApi(this.api, this.options).update(data);

    this.setProps({ cart });
  }

  getHandler(name) {
    const handler = this.handlers?.[name];

    return isFunction(handler) ? handler : null;
  }

  #registerHandlers(handlers) {
    this.handlers = handlers;
  }

  #loadLib(id, src, attributes = {}) {
    const scriptId = `${id}-${this.id}-component-lib`;

    return loadScript(scriptId, src, attributes);
  }

  #setProps(props) {
    if (!isObject(props)) {
      throw new Error('Props must be a plain object.');
    }

    this.props = {
      ...this.props,
      ...props,
    };
  }

  #render(props) {
    const { render, h } = this.#preact;

    this.#setProps(props);

    render(h(this.#preactComponent, this.props), this.#container);
  }
}
