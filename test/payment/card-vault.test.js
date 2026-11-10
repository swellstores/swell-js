import { describePayment } from './utils';
import VaultCardPayment from '../../src/payment/card/vault';

const mockCreateToken = jest.fn();

jest.mock('../../src/card', () => () => ({ createToken: mockCreateToken }));

describePayment('payment/card/vault', (request, options, paymentMock) => {
  const data = {
    number: '4242424242424242',
    exp_month: 8,
    exp_year: 2030,
    cvc: '123',
  };

  it('should tokenize the card through the vault and store it', async () => {
    paymentMock.getCart.mockResolvedValueOnce({ account_id: 'acc_1' });
    mockCreateToken.mockResolvedValueOnce({ token: 'tok_1', brand: 'Visa' });

    const payment = new VaultCardPayment(
      request,
      options,
      { data, billing: { name: 'Anna' } },
      { card: { gateway: 'braintree', mode: 'test' } },
    );

    await payment.tokenize();

    expect(mockCreateToken).toHaveBeenCalledWith({
      account_id: 'acc_1',
      billing: { name: 'Anna' },
      ...data,
    });
    expect(paymentMock.updateCart).toHaveBeenCalledWith({
      billing: {
        method: 'card',
        card: {
          token: 'tok_1',
          brand: 'Visa',
          test: true,
          gateway: 'braintree',
        },
      },
    });
    expect(paymentMock.onSuccess).toHaveBeenCalled();
  });

  it('should keep the gateway the vault answered with and no test flag in live mode', async () => {
    paymentMock.getCart.mockResolvedValueOnce({});
    mockCreateToken.mockResolvedValueOnce({
      token: 'tok_1',
      gateway: 'authorizenet',
    });

    const payment = new VaultCardPayment(
      request,
      options,
      { data },
      { card: { gateway: 'braintree', mode: 'live' } },
    );

    await payment.tokenize();

    expect(paymentMock.updateCart).toHaveBeenCalledWith({
      billing: {
        method: 'card',
        card: { token: 'tok_1', gateway: 'authorizenet' },
      },
    });
  });

  it('should throw without card details', async () => {
    const payment = new VaultCardPayment(
      request,
      options,
      {},
      { card: { gateway: 'braintree' } },
    );

    await expect(payment.tokenize()).rejects.toThrow(
      'Card details are missing',
    );
  });
});
