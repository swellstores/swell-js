function methods(request, opt) {
  return {
    /**
     * Get the decoded session as an object of session values
     */
    get() {
      return request('get', '/session');
    },

    /**
     * Get the encoded session cookie
     * This simplifies storing or passing the session to another system
     */
    getCookie() {
      return opt.getCookie('swell-session');
    },

    /**
     * Set the encoded session cookie
     * This simplifies restoring the session from another system
     */
    setCookie(value) {
      opt.setCookie('swell-session', value);
    },
  };
}

export default methods;
