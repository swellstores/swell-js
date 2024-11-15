import cacheApi from './cache.mjs';
import './index.a911a674.mjs';
import 'qs';
import './find.18f1ac6d.mjs';
import './round.577a8441.mjs';
import 'deepmerge';
import 'fast-case';

function methods(api, opt) {
  return {
    get: (type, id, query) => {
      return cacheApi.getFetch(`content_${type}`, id, () =>
        api.request('get', `/content/${type}`, id, {
          $preview: opt.previewContent,
          ...(query || {}),
        }),
      );
    },

    list: (type, query) =>
      api.request('get', `/content/${type}`, undefined, query),
  };
}

export { methods as default };
