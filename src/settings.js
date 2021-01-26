import { get, find, set, merge, toCamel, isObject, cloneDeep } from './utils';

function methods(request, opt) {
  return {
    state: null,
    menuState: null,
    paymentState: null,
    sessionState: null,

    locale: null,
    localizedState: {},

    refresh() {
      this.state = null;
      this.menuState = null;
      this.paymentState = null;
      this.sessionState = null;
      return this.get();
    },

    getState(uri, stateName, { id = undefined, def = undefined, refresh = false } = {}) {
      if (!this[stateName] || refresh) {
        this[stateName] = request('get', uri);
      }
      if (this[stateName] && typeof this[stateName].then === 'function') {
        return this[stateName].then((state) => {
          this[stateName] = state;
          return this.getLocalizedState(stateName, id, def);
        });
      }
      return this.getLocalizedState(stateName, id, def);
    },

    getLocalizedState(stateName, id, def) {
      if (!this.locale) {
        this.locale = opt.api.locale.selected();
      }
      const ls = this.localizedState;
      if (ls.code !== this.locale) {
        ls.code = this.locale;
        delete ls[this.locale];
      }
      if (!ls[this.locale]) {
        ls[this.locale] = {};
      }
      if (!ls[this.locale][stateName]) {
        ls[this.locale][stateName] = this.decodeLocale(this[stateName]);
      }
      return id ? get(ls[this.locale][stateName], id, def) : ls[this.locale][stateName];
    },

    findState(uri, stateName, { where = undefined, def = undefined } = {}) {
      const state = this.getState(uri, stateName);
      if (state && typeof state.then === 'function') {
        return state.then((state) => find(state, where) || def);
      }
      return find(state, where) || def;
    },

    get(id = undefined, def = undefined) {
      return this.getState('/settings', 'state', { id, def });
    },

    getStoreLocale() {
      return get(this.state, 'store.locale');
    },

    getStoreLocales() {
      return get(this.state, 'store.locales');
    },

    set({ model, path, value }) {
      const stateName = model ? `${model.replace(/s$/, '')}State` : 'state';
      const { useCamelCase } = opt;
      let mergeData = {};
      if (model === 'menus') {
        if (path !== undefined) {
          set(mergeData, path || '', value);
        } else {
          mergeData = value;
        }
      } else {
        set(mergeData, path || '', value);
      }
      if (useCamelCase) {
        mergeData = toCamel(mergeData);
      }
      this[stateName] = merge(this[stateName], mergeData);
    },

    menus(id = undefined, def = undefined) {
      return this.findState('/settings/menus', 'menuState', { where: { id }, def });
    },

    payments(id = undefined, def = undefined) {
      return this.getState('/settings/payments', 'paymentState', { id, def });
    },

    session(id = undefined, def = undefined) {
      return this.getState('/session', 'sessionState', { id, def });
    },

    decodeLocale(values) {
      if (!values || typeof values !== 'object') {
        return values;
      }
      let configs = this.getStoreLocales();
      if (configs) {
        configs = configs.reduce(
          (acc, config) => ({
            ...acc,
            [config.code]: config,
          }),
          {},
        );
      } else {
        configs = {};
      }
      return decodeLocaleObjects(cloneDeep(values), this.locale, configs);
    },

    async load() {
      try {
        const { settings, menus, payments, session } = await request('get', '/settings/all');
        this.state = settings;
        this.menuState = menus;
        this.paymentState = payments;
        this.sessionState = session;
      } catch (err) {
        console.error(`Swell: unable to loading settings (${err})`);
      }
    },
  };
}

function decodeLocaleObjects(values, locale, configs) {
  if (isObject(values)) {
    const keys = Object.keys(values);
    for (let key of keys) {
      if (key == '$locale') {
        decodeLocaleValue(locale, values, key, configs);
        delete values.$locale;
      }
      if (values[key] !== undefined) {
        values[key] = decodeLocaleObjects(values[key], locale, configs);
      }
    }
  } else if (values instanceof Array) {
    for (var i = 0; i < values.length; i++) {
      values[i] = decodeLocaleObjects(values[i], locale, configs);
    }
  }
  return values;
}

function decodeLocaleValue(locale, values, key, configs) {
  if (!locale || !isObject(values[key])) {
    return;
  }

  let returnLocaleKey;
  let returnLocaleConfig;
  const localeKeys = Object.keys(values[key]);
  for (let localeKey of localeKeys) {
    const shortKey = localeKey.replace(/\-.+$/, '');
    if (localeKey === locale || shortKey === locale) {
      returnLocaleKey = localeKey;
      returnLocaleConfig = configs[localeKey];
    }
  }

  // Find configured locale for fallback
  if (!returnLocaleKey && isObject(configs)) {
    const localeKeys = Object.keys(configs);
    for (let localeKey of localeKeys) {
      const shortKey = localeKey.replace(/\-.+$/, '');
      if (localeKey === locale || shortKey === locale) {
        returnLocaleKey = localeKey;
        returnLocaleConfig = configs[localeKey];
      }
    }
  }

  // Find fallback key and values if applicable
  let fallbackKeys;
  let fallbackValues = {};
  if (returnLocaleConfig) {
    let fallbackKey = returnLocaleConfig.fallback;
    const origFallbackKey = fallbackKey;
    while (fallbackKey) {
      fallbackKeys = fallbackKeys || [];
      fallbackKeys.push(fallbackKey);
      fallbackValues = { ...(values[key][fallbackKey] || {}), ...fallbackValues };
      fallbackKey = configs[fallbackKey] && configs[fallbackKey].fallback;
      if (origFallbackKey === fallbackKey) {
        break;
      }
    }
  }

  // Merge locale value with fallbacks
  let localeValues = { ...fallbackValues, ...(values[key][returnLocaleKey] || {}) };
  const valueKeys = Object.keys(localeValues);
  for (let valueKey of valueKeys) {
    const hasValue = localeValues[valueKey] !== null && localeValues[valueKey] !== '';
    let shouldFallback = fallbackKeys && !hasValue;
    if (shouldFallback) {
      for (let fallbackKey of fallbackKeys) {
        shouldFallback =
          !values[key][fallbackKey] ||
          values[key][fallbackKey][valueKey] === null ||
          values[key][fallbackKey][valueKey] === '';
        if (shouldFallback) {
          if (fallbackKey === 'none') {
            values[valueKey] = null;
            break;
          }
          continue;
        } else {
          values[valueKey] = values[key][fallbackKey][valueKey];
          break;
        }
      }
    } else {
      if (hasValue) {
        values[valueKey] = localeValues[valueKey];
      }
    }
  }
}

export default methods;
