import cache from './cache';

function methods(request, opt) {
  return {
    get: (type, id, query) => {
      return cache.getFetch(`content_${type}`, id, () =>
        request('get', `/content/${type}`, id, {
          $preview: opt.previewContent,
          ...(query || {}),
        }),
      );
    },

    list: (type, query) => request('get', `/content/${type}`, undefined, query),
  };
}

export default methods;