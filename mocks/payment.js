const mockPayment = {
  setElementContainer: function (elementId) {
    this.elementContainer = document.getElementById(elementId);
  },

  loadScripts: jest.fn(),

  getCart: jest.fn(() => {
    return Promise.resolve({});
  }),

  updateCart: jest.fn(),

  createIntent: jest.fn((params) => {
    const { gateway } = params;

    switch (gateway) {
      case 'amazon':
        return {
          redirect_url: 'https://www.amazon.com/',
        };
      case 'stripe':
        return {
          id: 'test_stripe_intent_id',
          client_secret: 'test_stripe_client_secret',
        };
      case 'paypal':
        return {
          id: 'paypal_order_id',
        };
      default:
        throw new Error(`Unknown gateway: ${gateway}`);
    }
  }),

  updateIntent: jest.fn((params) => {
    const { gateway } = params;

    switch (gateway) {
      case 'paypal':
        return {
          id: 'paypal_order_id',
        };

      case 'stripe':
        return { id: 'stripe' };

      default:
        throw new Error(`Unknown gateway: ${gateway}`);
    }
  }),

  authorizeGateway: jest.fn((params) => {
    const { gateway } = params;

    switch (gateway) {
      case 'amazon':
        return {
          payload: 'test_amazon_session_payload',
          signature: 'test_amazon_session_signature',
        };
      case 'braintree':
        return 'braintree_authorization';
      default:
        throw new Error(`Unknown gateway: ${gateway}`);
    }
  }),

  onSuccess: jest.fn(),
  onCancel: jest.fn(),
  onError: jest.fn(),
};

export default mockPayment;
