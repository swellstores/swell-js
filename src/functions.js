function methods(api, _opt) {
  return {
    /**
     * Make a request to an app function and greceiveet a response
     * @param {string} method
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    request(method, appId, functionName, data, options = undefined) {
      return api.request(method, functionName, undefined, data, {
        ...options,
        path: `/functions/${appId}`,
        useCamelCase: false, // avoid mutating data
      });
    },

    /**
     * Helper to make a GET request to an app function and receive a response
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    get(appId, functionName, data, options = undefined) {
      return this.request('get', appId, functionName, data, options);
    },

    /**
     * Helper to make a PUT request to an app function and receive a response
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    put(appId, functionName, data, options = undefined) {
      return this.request('put', appId, functionName, data, options);
    },

    /**
     * Helper to make a POST request to an app function and receive a response
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    post(appId, functionName, data, options = undefined) {
      return this.request('post', appId, functionName, data, options);
    },

    /**
     * Helper to make a DELETE request to an app function and receive a response
     * @param {string} appId
     * @param {string} functionName
     * @param {any} data
     * @param {object?} options
     * @returns {any}
     */
    delete(appId, functionName, data, options = undefined) {
      return this.request('delete', appId, functionName, data, options);
    },
  };
}

export default methods;
