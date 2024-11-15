import { d as defaultMethods } from './index.a911a674.mjs';
import cacheApi from './cache.mjs';
import 'qs';
import './find.18f1ac6d.mjs';
import './round.577a8441.mjs';
import 'deepmerge';
import 'fast-case';

function methods(api) {
  const { get, list } = defaultMethods(api, '/categories', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('categories', id, () => get(id, ...args));
    },

    list,
  };
}

export { methods as default };
