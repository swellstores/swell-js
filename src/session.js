function methods(request, opt) {
  return {
    state: null,

    get() {
      return request('get', '/session');
    },

    getCookie() {
      this.state = opt.getCookie('swell-session');
      return this.state;
    },

    setCookie(value) {
      this.state = value;
      opt.setCookie('swell-session', value);
      return this.state;
    },
  };
}

export default methods;
