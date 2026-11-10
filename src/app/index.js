import App from './app';
import { isEmpty } from '../utils';

let deprecationWarned = false;

/**
 * @deprecated App components are rendered by `@swell/apps-sdk/components`
 * (`createComponents().mount()`); this module will be removed in the next
 * major version.
 */
export default class AppController {
  #apps = new Map();

  constructor(api, options) {
    this.api = api;
    this.options = options;
  }

  /** @deprecated Use `@swell/apps-sdk/components` instead. */
  async load(appId) {
    if (!deprecationWarned) {
      deprecationWarned = true;
      console.warn(
        'swell.app is deprecated: render app components with @swell/apps-sdk/components',
      );
    }

    const loadedApp = this.#apps.get(appId);

    if (loadedApp) {
      return loadedApp;
    }

    const app = await this.#getApp(appId);
    const appInstance = new App(app, this.api, this.options);

    this.#apps.set(appId, appInstance);

    return appInstance;
  }

  async #getApp(appId) {
    const app = await this.api.request('get', `/apps/${appId}`, undefined, {
      expand: 'components',
    });

    if (isEmpty(app.extensions)) {
      throw new Error(
        `The app "${app.name}" has no extensions. Define the app extensions in "swell.json".`,
      );
    }

    return app;
  }
}
