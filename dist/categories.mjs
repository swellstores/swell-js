import { d as defaultMethods } from './index.738bc14a.mjs';
import cacheApi from './cache.mjs';
import 'qs';
import './find.18f1ac6d.mjs';
import './round.577a8441.mjs';
import 'deepmerge';
import 'fast-case';

function methods(request) {
  const { get, list } = defaultMethods(request, '/categories', ['list', 'get']);

  return {
    get: (id, ...args) => {
      return cacheApi.getFetch('categories', id, () => get(id, ...args));
    },

    list,
  };
}

export { methods as default };
