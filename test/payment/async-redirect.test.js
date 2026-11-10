import { describePayment } from './utils';
import PaymentController from '../../src/payment';

describePayment('payment#handleAsyncRedirect', (_request, options) => {
  const request = jest.fn(async () => ({
    id: 'pay_1',
    captured: false,
    async_data: { url: 'https://bank.test/confirm' },
  }));

  it('should redirect to the pending payment', async () => {
    const payment = new PaymentController({ request }, options);

    const result = await payment.handleAsyncRedirect({
      status: 'payment_pending',
      authorized_payment_id: 'pay_1',
    });

    expect(result).toBe(true);
    expect(request).toHaveBeenCalledWith('get', '/payments', 'pay_1');
    expect(window.location.replace).toHaveBeenCalledWith(
      'https://bank.test/confirm',
    );
  });

  it('should do nothing for a completed order or a captured payment', async () => {
    const payment = new PaymentController({ request }, options);

    expect(await payment.handleAsyncRedirect({ status: 'complete' })).toBe(
      false,
    );

    request.mockResolvedValueOnce({ captured: true, async_data: { url: 'x' } });
    expect(
      await payment.handleAsyncRedirect({
        status: 'payment_pending',
        authorized_payment_id: 'pay_1',
      }),
    ).toBe(false);
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
