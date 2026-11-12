import { describePayment } from './utils';
import PaymentController from '../../src/payment';

describePayment('payment#createElements', (_request, options) => {
  it('should build each call from its own params when two run at once', async () => {
    const payment = new PaymentController({ request: jest.fn() }, options);
    const created = [];

    class FakePayment {
      constructor(_api, _options, params) {
        this.params = params;
      }

      createElements() {
        created.push(this.params.name);
      }

      mountElements() {}
    }

    // The methods load slowly, so the second call starts before the first builds its instances
    payment._getPaymentMethods = () =>
      new Promise((resolve) =>
        setTimeout(() => resolve({ card: {}, ideal: {} }), 10),
      );
    payment._getPaymentClass = () => FakePayment;
    payment.payment.getCart = async () => ({});

    await Promise.all([
      payment.createElements({ card: { name: 'card' } }),
      payment.createElements({ ideal: { name: 'ideal' } }),
    ]);

    expect(created.sort()).toEqual(['card', 'ideal']);
  });
});
