import { d as defaultMethods } from './index-b1ee0b3d.js';
import { c as cacheApi } from './cache-f2b62a15.js';

function methods(request) {
  const { get, list } = defaultMethods(request, "/attributes", ["list", "get"]);
  return {
    get: (id, ...args) => {
      return cacheApi.getFetch("attributes", id, () => get(id, ...args));
    },
    list
  };
}

export { methods as m };
