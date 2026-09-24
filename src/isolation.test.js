import swell from './api';

describe('instance isolation', () => {
  const noCookies = { getCookie: () => undefined, setCookie: () => {} };
  const card = {
    number: '4242 4242 4242 4242',
    exp_month: 1,
    exp_year: new Date().getUTCFullYear() + 5,
    cvc: '321',
  };

  let a;
  let b;

  function callsTo(host) {
    return fetch.mock.calls.filter(([url]) => String(url).includes(host));
  }

  beforeEach(() => {
    fetch.mockResponse((req) =>
      Promise.resolve(
        JSON.stringify(
          req.url.includes('vault')
            ? { $status: 200, $data: { token: 't_test' } }
            : { id: 'shirt', name: new URL(req.url).host },
        ),
      ),
    );

    a = swell.create('store-a', 'pk_a', {
      ...noCookies,
      vaultUrl: 'https://vault-a.test',
      timeout: 1000,
    });
    b = swell.create('store-b', 'pk_b', {
      ...noCookies,
      vaultUrl: 'https://vault-b.test',
      timeout: 2000,
      useCamelCase: true,
    });
  });

  afterEach(() => {
    for (const instance of [a, b]) {
      instance.cache
        .values({ model: 'products', id: 'shirt' })
        .recordTimer?.unref();
    }
  });

  it('should tokenize cards with the calling instance vault url and key', async () => {
    await a.card.createToken(card);
    await b.card.createToken(card);

    expect(callsTo('vault-a.test')).toHaveLength(1);
    expect(callsTo('vault-a.test')[0][0]).toContain('%24key=pk_a');
    expect(callsTo('vault-b.test')).toHaveLength(1);
    expect(callsTo('vault-b.test')[0][0]).toContain('%24key=pk_b');
  });

  it('should send payment intents to the calling instance vault', async () => {
    await a.payment.createIntent({ gateway: 'stripe' });

    expect(callsTo('vault-a.test')).toHaveLength(1);
    expect(callsTo('vault-a.test')[0][0]).toContain('%24key=pk_a');
    expect(callsTo('vault-b.test')).toHaveLength(0);
  });

  it('should keep the default instance options when other instances are created', async () => {
    swell.init('test', 'pk_test');
    swell.create('other', 'pk_other', noCookies);

    await swell.card.createToken(card);

    expect(fetch.mock.calls[0][0]).toContain('%24key=pk_test');
  });

  it('should calculate variations with the calling instance case option', () => {
    const product = { id: 'shirt', price: 1, some_field: 1 };

    expect(a.products.variation(product)).toHaveProperty('some_field');
    expect(b.products.variation(product)).toHaveProperty('someField');
  });

  it('should not share cached records between instances', async () => {
    await a.products.get('shirt');
    a.cache.set({ model: 'products', id: 'shirt', value: { name: 'edited' } });

    expect(await a.products.get('shirt')).toHaveProperty('name', 'edited');
    expect(await b.products.get('shirt')).toHaveProperty(
      'name',
      'store-b.swell.store',
    );
    expect(callsTo('store-a.swell.store')).toHaveLength(1);
    expect(callsTo('store-b.swell.store')).toHaveLength(1);
    expect(a.cache).not.toBe(b.cache);
  });

  it('should send each instance store, key, session, locale and currency on concurrent requests', async () => {
    const cookies = (values) => ({
      getCookie: (name) => values[name],
      setCookie: () => {},
    });
    const c = swell.create(
      'store-c',
      'pk_c',
      cookies({
        'swell-session': 'session-c',
        'swell-locale': 'en-US',
        'swell-currency': 'USD',
      }),
    );
    const d = swell.create(
      'store-d',
      'pk_d',
      cookies({
        'swell-session': 'session-d',
        'swell-locale': 'fr-FR',
        'swell-currency': 'EUR',
      }),
    );

    await Promise.all([c.get('/cart'), d.get('/cart')]);

    const [[urlC, { headers: headersC }]] = callsTo('store-c.swell.store');
    const [[urlD, { headers: headersD }]] = callsTo('store-d.swell.store');

    expect(urlC).toBe('https://store-c.swell.store/api/cart');
    expect(headersC).toMatchObject({
      Authorization: `Basic ${Buffer.from('pk_c').toString('base64')}`,
      'X-Session': 'session-c',
      'X-Locale': 'en-US',
      'X-Currency': 'USD',
    });
    expect(urlD).toBe('https://store-d.swell.store/api/cart');
    expect(headersD).toMatchObject({
      Authorization: `Basic ${Buffer.from('pk_d').toString('base64')}`,
      'X-Session': 'session-d',
      'X-Locale': 'fr-FR',
      'X-Currency': 'EUR',
    });
  });
});
