import api from './api';

describe('consent', () => {
  beforeEach(() => {
    global.document = { cookie: '', referrer: 'https://www.tiktok.com/' };
    global.window = {
      document: global.document,
      location: {
        origin: 'https://shop.example.com',
        href: 'https://shop.example.com/cart',
      },
      performance: {
        getEntriesByType: () => [
          { name: 'https://shop.example.com/?ttclid=X&utm_source=tiktok' },
        ],
      },
    };
    api.init('test', 'pk_test');
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('should call the storefront origin with the answers and the landing page', async () => {
    await api.consent.set({ marketing: true, analytics: false, other: true });

    const [url, request] = fetch.mock.calls[0];
    expect(url).toBe('https://shop.example.com/api/session/consent');
    expect(request.method).toBe('put');
    expect(request.credentials).toBe('include');
    expect(JSON.parse(request.body)).toEqual({
      marketing: true,
      analytics: false,
      landing: {
        url: 'https://shop.example.com/?ttclid=X&utm_source=tiktok',
        referrer: 'https://www.tiktok.com/',
      },
    });
  });

  it('should accept saleOfData', async () => {
    await api.consent.set({ saleOfData: false });

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      sale_of_data: false,
    });
  });

  it('should give a camelCase client the result in camelCase', async () => {
    api.init('test', 'pk_test', { useCamelCase: true });
    fetch.mockResponseOnce(
      JSON.stringify({
        analytics: null,
        marketing: true,
        sale_of_data: null,
        gpc: false,
        rule: 'opt_in',
        effective: { analytics: false, marketing: true, sale_of_data: true },
      }),
    );

    const result = await api.consent.set({ saleOfData: true });

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      sale_of_data: true,
    });
    expect(result).toEqual({
      analytics: null,
      marketing: true,
      saleOfData: null,
      gpc: false,
      rule: 'opt_in',
      effective: { analytics: false, marketing: true, saleOfData: true },
    });
  });

  it('should send calls one after another', async () => {
    let finishFirst;
    fetch.mockResponseOnce(
      () =>
        new Promise((resolve) => {
          finishFirst = () => resolve(JSON.stringify({}));
        }),
    );

    const first = api.consent.set({ marketing: true });
    const second = api.consent.set({ analytics: true });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The second waits for the first, which may set the visitor cookie
    expect(fetch.mock.calls.length).toBe(1);

    finishFirst();
    await Promise.all([first, second]);

    expect(fetch.mock.calls.length).toBe(2);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      analytics: true,
    });
  });

  it('should send the next call after a failed one', async () => {
    fetch.mockRejectOnce(new Error('offline'));

    await expect(api.consent.set({ marketing: true })).rejects.toThrow(
      'offline',
    );
    await api.consent.set({ marketing: true });

    expect(fetch.mock.calls.length).toBe(2);
  });

  it('should only run in the browser', async () => {
    delete global.window;

    await expect(api.consent.set({ marketing: true })).rejects.toThrow(
      'browser',
    );
    expect(fetch.mock.calls.length).toBe(0);
  });
});

describe('visitor header', () => {
  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('should send the swell-visitor cookie as X-Visitor', async () => {
    api.init('test', 'pk_test', {
      getCookie: (name) => (name === 'swell-visitor' ? 'token1' : undefined),
    });

    await api.cart.get();

    expect(fetch.mock.calls[0][1].headers['X-Visitor']).toBe('token1');
  });

  it('should send no X-Visitor without the cookie', async () => {
    api.init('test', 'pk_test', { getCookie: () => undefined });

    await api.cart.get();

    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('X-Visitor');
  });
});
