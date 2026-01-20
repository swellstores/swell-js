import { AppPaymentComponent } from './component';
import { isObject, isEmpty } from '../utils';

export default class App {
  constructor(app, api, options) {
    this.app = app;
    this.api = api;
    this.options = options;
  }

  get #components() {
    return this.app.components?.results || [];
  }

  getComponent(name) {
    if (!name) {
      throw new Error('Component name is not provided');
    }

    const component = this.#components.find(
      (component) => component.name === name,
    );

    if (!component) {
      throw new Error(`Component "${name}" not found`);
    }

    return this.#createComponent(component);
  }

  getComponents(params = {}) {
    const components = this.#filterComponents(params);

    return components.reduce((acc, component) => {
      acc[component.name] = this.#createComponent(component);

      return acc;
    }, {});
  }

  #filterComponents(params) {
    if (!isObject(params) || isEmpty(params)) {
      return this.#components;
    }

    const { extension, extensionType } = params;

    if (extensionType) {
      return this.#filterByExtensionType(extensionType);
    }

    if (extension) {
      return this.#filterByExtension(extension);
    }

    return [];
  }

  #filterByExtensionType(extensionType) {
    const extensions = this.app.extensions
      .filter((extension) => extension.type === extensionType)
      .map((extension) => extension.id);

    return extensions
      .map((extension) => this.#filterByExtension(extension))
      .flat();
  }

  #filterByExtension(extension) {
    return this.#components.filter(
      (component) => component.values.extension === extension,
    );
  }

  #createComponent(component) {
    const { extensions } = this.app;
    const {
      name,
      values: { extension: componentExtension },
    } = component;

    if (!componentExtension) {
      throw new Error(
        `The component "${name}" has no extension. Define the extension in the component's config.`,
      );
    }

    const extension = extensions.find(
      (extension) => extension.id === componentExtension,
    );

    if (!extension) {
      throw new Error(
        `The extension "${componentExtension}" of component "${name}" is not defined in "swell.json".`,
      );
    }

    switch (extension.type) {
      case 'payment':
        return new AppPaymentComponent(
          this.app,
          component,
          this.api,
          this.options,
        );
      default:
        throw new Error(`Unknown extension type "${extension.type}".`);
    }
  }
}
