import mockPayment from '../../mocks/payment';

jest.mock('../../src/payment/payment.js', () => {
  return function (request, options, params, method) {
    this.request = request;
    this.options = options;
    this.params = params;
    this.method = method;

    return Object.assign(this, mockPayment);
  };
});

function mockWindow() {
  global.window = {
    location: {
      origin: 'http://test.swell.test',
      pathname: '/checkout',
      replace: jest.fn(),
    },
  };
}

function clearGlobal() {
  global.window = undefined;
  global.document = undefined;
}

export function describePayment(description, callback) {
  const request = jest.fn();
  const options = {};

  // eslint-disable-next-line jest/valid-title
  describe(description, () => {
    beforeEach(() => {
      mockWindow();
    });

    afterEach(() => {
      clearGlobal();
    });

    callback(request, options, mockPayment);
  });
}
