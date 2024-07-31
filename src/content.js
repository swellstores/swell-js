import cache from './cache';

function methods(api, opt) {
  return {
    get: (type, id, query) => {
      return cache.getFetch(`content_${type}`, id, () =>
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

export default methods;
