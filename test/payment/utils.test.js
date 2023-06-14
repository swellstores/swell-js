import { adjustParams, adjustMethodParams } from '../../src/payment/utils';

describe('#adjustParams', () => {
  beforeEach(() => {
    console.warn = jest.fn();
  });

  it('should move the "config" field to the method params', () => {
    const params = adjustParams({
      config: {
        fonts: [
          {
            cssSrc: 'https://fonts.googleapis.com/css?family=Audiowide',
          },
        ],
      },
      card: {},
      ideal: {},
    });

    expect(params).toEqual({
      card: {
        config: {
          fonts: [
            { cssSrc: 'https://fonts.googleapis.com/css?family=Audiowide' },
          ],
        },
      },
      ideal: {
        config: {
          fonts: [
            { cssSrc: 'https://fonts.googleapis.com/css?family=Audiowide' },
          ],
        },
      },
    });
    expect(console.warn).toHaveBeenCalledWith(
      'Please move the "config" field to the "card.config"',
    );
    expect(console.warn).toHaveBeenCalledWith(
      'Please move the "config" field to the "ideal.config"',
    );
  });
});

describe('#adjustMethodParams', () => {
  beforeEach(() => {
    console.warn = jest.fn();
  });

  it('should remove the "#" sign from the element ID', () => {
    const params = adjustMethodParams({ elementId: '#card-element' });

    expect(params).toEqual({ elementId: 'card-element' });
    expect(console.warn).toHaveBeenCalledWith(
      'Please remove the "#" sign from the "#card-element" element ID',
    );
  });

  it('should remove the "#" sign from the element ID (separate elements)', () => {
    const params = adjustMethodParams({
      separateElements: true,
      cardNumber: { elementId: '#cardNumber-element' },
      cardExpiry: { elementId: '#cardExpiry-element' },
      cardCvc: { elementId: '#cardCvc-element' },
    });

    expect(params).toEqual({
      separateElements: true,
      cardNumber: { elementId: 'cardNumber-element' },
      cardExpiry: { elementId: 'cardExpiry-element' },
      cardCvc: { elementId: 'cardCvc-element' },
    });
    expect(console.warn).toHaveBeenCalledWith(
      'Please remove the "#" sign from the "#cardNumber-element" element ID',
    );
    expect(console.warn).toHaveBeenCalledWith(
      'Please remove the "#" sign from the "#cardExpiry-element" element ID',
    );
    expect(console.warn).toHaveBeenCalledWith(
      'Please remove the "#" sign from the "#cardCvc-element" element ID',
    );
  });
});
