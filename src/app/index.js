import App from './app';
import { isEmpty } from '../utils';

export default class AppController {
  #apps = new Map();

  constructor(api, options) {
    this.api = api;
    this.options = options;
  }

  async load(appId) {
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
