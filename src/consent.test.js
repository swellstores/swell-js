import api from './api';

// Swell's answer to a consent call
const ANSWER = JSON.stringify({
  analytics: null,
  marketing: null,
  sale_of_data: null,
  gpc: false,
  rule: 'opt_in',
  effective: { analytics: false, marketing: false, sale_of_data: false },
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// swell-js records each landing of a page once: every test lands anew
let landings = 0;

function setPage({ landing, origin = 'https://shop.example.com' } = {}) {
  landings += 1;
  const url = landing || `${origin}/?ttclid=X${landings}&utm_source=tiktok`;
  global.document = { cookie: '', referrer: 'https://www.tiktok.com/' };
  const storage = new Map();
  global.window = {
    document: global.document,
    location: { origin, href: `${origin}/cart`, protocol: 'https:' },
    performance: { getEntriesByType: () => [{ name: url }] },
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
    },
  };
  return url;
}

// A page of the storefront without a click id or UTM tag
function leaveLanding() {
  global.window.performance = {
    getEntriesByType: () => [{ name: 'https://shop.example.com/products' }],
  };
}

describe('consent', () => {
  let landingUrl;

  beforeEach(async () => {
    landingUrl = setPage();
    fetch.mockResponse(ANSWER);
    api.init('test', 'pk_test');
    // The landing call of init
    await flush();
    fetch.resetMocks();
    fetch.mockResponse(ANSWER);
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
      landing: { url: landingUrl, referrer: 'https://www.tiktok.com/' },
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
          finishFirst = () => resolve(ANSWER);
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

describe('consent on a headless storefront', () => {
  const API = 'https://test.swell.store/api/session/consent';
  const ORIGIN = 'https://shop.example.com/api/session/consent';
  const TOKEN = 'T'.repeat(43);
  let landingUrl;

  beforeEach(() => {
    // Init before the page: no landing call
    api.init('test', 'pk_test');
    landingUrl = setPage();
    global.document.cookie = '_fbp=fb.1.2; other=x; _ttp=ttp1';
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it("should call the store's API host when the origin isn't Swell's, with the ad cookies, and keep the visitor cookie", async () => {
    fetch.mockResponseOnce('Not found', { status: 404 });
    fetch.mockResponseOnce(
      JSON.stringify({ ...JSON.parse(ANSWER), visitor: TOKEN }),
    );

    const result = await api.consent.set({ marketing: true });

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([ORIGIN, API]);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      marketing: true,
      landing: { url: landingUrl, referrer: 'https://www.tiktok.com/' },
      cookies: { _fbp: 'fb.1.2', _ttp: 'ttp1' },
      direct: true,
    });
    expect(result).not.toHaveProperty('visitor');
    expect(result.rule).toBe('opt_in');
    expect(global.document.cookie).toMatch(
      `swell-visitor=${TOKEN}; path=/; max-age=7776000; samesite=lax; secure`,
    );
  });

  it('should call the API host only, once the origin answered', async () => {
    fetch.mockResponseOnce('<html></html>');
    await api.consent.set({ marketing: true });
    global.document.cookie = `swell-visitor=${TOKEN}`;

    await api.consent.set({ analytics: true });

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([ORIGIN, API, API]);
    expect(fetch.mock.calls[2][1].headers['X-Visitor']).toBe(TOKEN);
  });

  it("should call the API host when Swell refuses the origin's call, which a proxy forwarded", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        error: {
          code: 'storefront_origin_required',
          message: 'storefront only',
        },
      }),
      { status: 400 },
    );

    await api.consent.set({ marketing: true });

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([ORIGIN, API]);
  });

  it("should not call the API host on another refusal of Swell's", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        error: { code: 'permission_error', message: 'Not allowed' },
      }),
      { status: 400 },
    );

    await expect(api.consent.set({ marketing: true })).rejects.toThrow(
      'Not allowed',
    );
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([ORIGIN]);
  });

  it('should not call the API host on a rate limit, whatever its code', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({ error: { code: 'storefront_origin_required' } }),
      { status: 429 },
    );

    await expect(api.consent.set({ marketing: true })).rejects.toThrow();
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([ORIGIN]);
  });

  it('should call the API host when the answer has no effect', async () => {
    fetch.mockResponseOnce(JSON.stringify({ effective: null }));

    await api.consent.set({ marketing: true });

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([ORIGIN, API]);
  });

  it("should not call the API host from a page on Swell's domain", async () => {
    setPage({ origin: 'https://test--sf1.swell.store' });
    // A body cut off reads as no answer
    fetch.mockResponseOnce('');

    await expect(api.consent.set({ marketing: true })).rejects.toThrow(
      'not served by Swell',
    );
    expect(fetch.mock.calls.length).toBe(1);
  });

  it('should keep a late answer for the store that was asked', async () => {
    fetch.mockResponseOnce('Not found', { status: 404 });
    let answer;
    fetch.mockResponseOnce(
      () =>
        new Promise((resolve) => {
          answer = () =>
            resolve(JSON.stringify({ ...JSON.parse(ANSWER), capture: false }));
        }),
    );

    const pending = api.consent.set({ marketing: true });
    await flush();
    await flush();
    // The client is now for another store
    leaveLanding();
    api.init('other', 'pk_other');
    answer();
    await pending;

    const storage = global.window.sessionStorage;
    expect(storage.getItem('swell-consent-off:https://test.swell.store')).toBe(
      '1',
    );
    expect(
      storage.getItem('swell-consent-direct:https://test.swell.store'),
    ).toBe('1');
    expect(storage.getItem('swell-consent-off:https://other.swell.store')).toBe(
      null,
    );
    expect(
      storage.getItem('swell-consent-direct:https://other.swell.store'),
    ).toBe(null);
  });

  it('should keep the switch for each API host of the tab', async () => {
    const OTHER = 'https://other.swell.store/api/session/consent';
    fetch.mockResponseOnce('Not found', { status: 404 });
    await api.consent.set({ marketing: true });

    // The next page has another store's client, which switches too
    leaveLanding();
    const other = api.create('other', 'pk_other');
    fetch.mockResponseOnce('Not found', { status: 404 });
    await other.consent.set({ marketing: true });

    // And the one after it both
    api.init('test', 'pk_test');
    other.init('other', 'pk_other');
    await api.consent.set({ marketing: true });
    await other.consent.set({ marketing: true });

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      ORIGIN,
      API,
      ORIGIN,
      OTHER,
      API,
      OTHER,
    ]);
  });

  it("should not call the API host after the origin's server error", async () => {
    fetch.mockResponseOnce('Bad gateway', { status: 502 });
    await expect(api.consent.set({ marketing: true })).rejects.toThrow();
    fetch.mockResponseOnce(
      JSON.stringify({ error: { message: 'Too many requests' } }),
      { status: 429 },
    );
    await expect(api.consent.set({ marketing: true })).rejects.toThrow();

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([ORIGIN, ORIGIN]);
  });

  it("should not call a `url` that isn't Swell's: the storefront's proxy", async () => {
    api.init('test', 'pk_test', { url: 'https://api.shop.example.com' });
    fetch.mockResponseOnce('Not found', { status: 404 });

    await expect(api.consent.set({ marketing: true })).rejects.toThrow();
    expect(fetch.mock.calls.length).toBe(1);
  });

  it("should call the API host straight on the tab's next page", async () => {
    fetch.mockResponseOnce('Not found', { status: 404 });
    await api.consent.set({ marketing: true });

    // The next page: a new document, the same tab
    leaveLanding();
    api.init('test', 'pk_test');
    await api.consent.set({ marketing: true });

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([ORIGIN, API, API]);
  });

  it('should resolve when the cookie adapter fails: Swell recorded the call', async () => {
    leaveLanding();
    api.init('test', 'pk_test', {
      setCookie: () => {
        throw new Error('read-only');
      },
    });
    fetch.mockResponseOnce('Not found', { status: 404 });
    fetch.mockResponseOnce(
      JSON.stringify({ ...JSON.parse(ANSWER), visitor: TOKEN }),
    );

    const result = await api.consent.set({ marketing: true });

    expect(result.rule).toBe('opt_in');
  });

  it('should not call the API host after a network failure', async () => {
    fetch.mockRejectOnce(new Error('offline'));

    await expect(api.consent.set({ marketing: true })).rejects.toThrow(
      'offline',
    );
    expect(fetch.mock.calls.length).toBe(1);
  });

  it('should not call the API host when it is the origin', async () => {
    api.init('test', 'pk_test', { url: 'https://shop.example.com' });
    fetch.mockResponseOnce('Not found', { status: 404 });

    await expect(api.consent.set({ marketing: true })).rejects.toThrow();
    expect(fetch.mock.calls.length).toBe(1);
  });
});

describe('ad landing', () => {
  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('should record an ad landing without an answer on init', async () => {
    const url = setPage();
    fetch.mockResponse(ANSWER);

    api.init('test', 'pk_test');
    await flush();

    expect(fetch.mock.calls.length).toBe(1);
    const [requestUrl, request] = fetch.mock.calls[0];
    expect(requestUrl).toBe('https://shop.example.com/api/session/consent');
    expect(JSON.parse(request.body)).toEqual({
      landing: { url, referrer: 'https://www.tiktok.com/' },
    });
  });

  it('should record it once, also on another init', async () => {
    setPage();
    fetch.mockResponse(ANSWER);

    api.init('test', 'pk_test');
    api.init('test', 'pk_test');
    await flush();

    expect(fetch.mock.calls.length).toBe(1);
  });

  it('should record it on the API host of a headless storefront', async () => {
    setPage();
    fetch.mockResponseOnce('Not found', { status: 404 });
    fetch.mockResponseOnce(ANSWER);

    api.init('test', 'pk_test');
    await flush();
    await flush();

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      'https://shop.example.com/api/session/consent',
      'https://test.swell.store/api/session/consent',
    ]);
  });

  it('should record nothing without a click id or a UTM tag', async () => {
    setPage({ landing: 'https://shop.example.com/?q=shoes' });

    api.init('test', 'pk_test');
    await flush();

    expect(fetch.mock.calls.length).toBe(0);
  });

  it('should wait for the page to load, when the ad pixels have set their cookies', async () => {
    setPage();
    const listeners = {};
    global.document.readyState = 'interactive';
    global.window.addEventListener = (type, listener) => {
      listeners[type] = listener;
    };
    fetch.mockResponse(ANSWER);

    api.init('test', 'pk_test');
    await flush();
    expect(fetch.mock.calls.length).toBe(0);

    listeners.load();
    await flush();
    expect(fetch.mock.calls.length).toBe(1);
  });

  it('should send no more landings in the tab once the store records nothing', async () => {
    setPage();
    fetch.mockResponse(
      JSON.stringify({ ...JSON.parse(ANSWER), capture: false }),
    );

    api.init('test', 'pk_test');
    await flush();
    expect(fetch.mock.calls.length).toBe(1);

    // Another landing in the same tab
    const storage = global.window.sessionStorage;
    setPage();
    global.window.sessionStorage = storage;
    api.init('test', 'pk_test');
    await flush();
    expect(fetch.mock.calls.length).toBe(1);

    // The answers still go
    const result = await api.consent.set({ marketing: true });
    expect(result.capture).toBe(false);
    expect(fetch.mock.calls.length).toBe(2);
  });

  it('should send no landing queued behind an answer that nothing is recorded', async () => {
    setPage();
    const listeners = {};
    global.document.readyState = 'interactive';
    global.window.addEventListener = (type, listener) => {
      listeners[type] = listener;
    };
    let answer;
    fetch.mockResponseOnce(
      () =>
        new Promise((resolve) => {
          answer = () =>
            resolve(JSON.stringify({ ...JSON.parse(ANSWER), capture: false }));
        }),
    );

    api.init('test', 'pk_test');
    const pending = api.consent.set({ marketing: true });
    await flush();
    listeners.load();
    answer();
    await pending;
    await flush();

    expect(fetch.mock.calls.length).toBe(1);
  });

  it('should send no landing once a later init points at the page origin', async () => {
    setPage();
    const listeners = {};
    global.document.readyState = 'loading';
    global.window.addEventListener = (type, listener) => {
      listeners[type] = listener;
    };
    fetch.mockResponse(ANSWER);

    api.init('test', 'pk_test');
    api.init('test', 'pk_test', { url: 'https://shop.example.com' });
    listeners.load();
    await flush();

    expect(fetch.mock.calls.length).toBe(0);
  });

  it('should record the landing for each store of the page', async () => {
    setPage();
    fetch.mockResponse(ANSWER);
    const other = api.create();

    api.init('test', 'pk_test');
    other.init('other', 'pk_other');
    await flush();

    expect(fetch.mock.calls.length).toBe(2);
  });

  it('should leave the landing to Swell when the API is on the page origin', async () => {
    setPage();

    api.init('test', 'pk_test', { url: 'https://shop.example.com' });
    await flush();

    expect(fetch.mock.calls.length).toBe(0);
  });

  it('should not break init when the call fails', async () => {
    setPage();
    fetch.mockReject(new Error('offline'));

    expect(() => api.init('test', 'pk_test')).not.toThrow();
    await flush();
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
