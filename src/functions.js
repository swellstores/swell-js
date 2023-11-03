function methods(request, _opt) {
  return {
    request(method, appId, functionName, data, options = undefined) {
      return request(method, functionName, undefined, data, {
        ...options,
        path: `/functions/${appId}`,
      });
    },

    get(appId, functionName, data, options = undefined) {
      return this.request('get', appId, functionName, data, options);
    },

    put(appId, functionName, data, options = undefined) {
      return this.request('put', appId, functionName, data, options);
    },

    post(appId, functionName, data, options = undefined) {
      return this.request('post', appId, functionName, data, options);
    },

    delete(appId, functionName, data, options = undefined) {
      return this.request('delete', appId, functionName, data, options);
    },
  };
}

export default methods;
