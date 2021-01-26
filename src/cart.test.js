import api from './api';

describe('cart', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('get', () => {
    it('should make request to GET /cart', async () => {
      await api.cart.get();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should register response state', async () => {
      fetch.mockResponseOnce(JSON.stringify({ grand_total: 1000 }));
      await api.cart.get();
      expect(api.cart.state).toEqual({ grand_total: 1000 });
    });
  });

  describe('clearCache', () => {
    it('should make request to GET /cart?$cache=false (once only)', async () => {
      api.cart.clearCache();
      await api.cart.get();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart?$cache=false`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');

      await api.cart.get();

      expect(fetch.mock.calls.length).toEqual(2);
      expect(fetch.mock.calls[1][0]).toEqual(`https://test.swell.store/api/cart`);
      expect(fetch.mock.calls[1][1]).toHaveProperty('method', 'get');
    });
  });

  describe('addItem', () => {
    it('should make request to POST /cart/items', async () => {
      await api.cart.addItem({ product_id: '123' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify({ product_id: '123' }));
    });

    it('should make request to POST /cart/items with clean options', async () => {
      await api.cart.addItem({ product_id: '123', options: { color: 'red' } });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ product_id: '123', options: [{ id: 'color', value: 'red' }] }),
      );
    });

    it('should not mutate input item request to POST /cart/items with clean options', async () => {
      const item = { product_id: '123', options: [ { name: 'Size', value: '1 cup' } ] };
      await api.cart.addItem(item);

      expect(item).toEqual({ product_id: '123', options: [ { name: 'Size', value: '1 cup' } ] });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ product_id: '123', options: [{ id: 'Size', value: '1 cup' }] }),
      );
    });

    it('should wait until the first request/response before making subsequent calls', async () => {
      fetch
        .mockResponseOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ body: JSON.stringify({ grand_total: 1000 }) }), 100),
            ),
        )
        .mockResponseOnce(
          () =>
            new Promise((resolve) =>
              resolve({ body: JSON.stringify({ ...(api.cart.state || {}), waited: true }) }),
            ),
        )
        .mockResponseOnce(
          () =>
            new Promise((resolve) =>
              resolve({ body: JSON.stringify({ ...(api.cart.state || {}), again: true }) }),
            ),
        );

      api.cart.state = null;

      const [result1, result2] = await Promise.all([
        api.cart.addItem({ product_id: '123', options: { color: 'red' } }),
        api.cart.addItem({ product_id: '124', options: { color: 'blue' } }),
      ]);

      await api.cart.update({ again: true })

      expect(api.cart.state).toEqual({
        grand_total: 1000,
        waited: true,
        again: true,
      });
    });
  });

  describe('setItems', () => {
    it('should make request to PUT /cart/items', async () => {
      await api.cart.setItems([{ quantity: 2 }]);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify([{ quantity: 2 }]));
    });

    it('should make request to PUT /cart/items with clean options', async () => {
      await api.cart.setItems([{ quantity: 2, options: { color: 'red' } }]);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify([{ quantity: 2, options: [{ id: 'color', value: 'red' }] }]),
      );
    });
  });

  describe('updateItem', () => {
    it('should make request to PUT /cart/items/id', async () => {
      await api.cart.updateItem('12345', { quantity: 2 });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items/12345`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify({ quantity: 2 }));
    });

    it('should make request to PUT /cart/items/id with clean options', async () => {
      await api.cart.updateItem('12345', { quantity: 2, options: { color: 'red' } });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items/12345`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ quantity: 2, options: [{ id: 'color', value: 'red' }] }),
      );
    });
  });

  describe('removeItem', () => {
    it('should make request to DELETE /cart/items/id', async () => {
      await api.cart.removeItem('12345');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/items/12345`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
    });
  });

  describe('recover', () => {
    it('should make request to PUT /cart/recover/id', async () => {
      await api.cart.recover('12345');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/recover/12345`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
    });
  });

  describe('update', () => {
    it('should make request to PUT /api/cart', async () => {
      await api.cart.update({
        shipping: {
          name: 'Test Customer',
        },
      });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ shipping: { name: 'Test Customer' } }),
      );
    });
  });

  describe('applyCoupon', () => {
    it('should make request to PUT /api/cart/coupon', async () => {
      await api.cart.applyCoupon('FREESHIPPING');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/coupon`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ code: 'FREESHIPPING' }),
      );
    });
  });

  describe('removeCoupon', () => {
    it('should make request to DELETE /api/cart/coupon', async () => {
      await api.cart.removeCoupon();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/coupon`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
    });
  });

  describe('applyGiftcard', () => {
    it('should make request to POST /api/cart/giftcards', async () => {
      await api.cart.applyGiftcard('XXX XXX XXX XXX');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/giftcards`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ code: 'XXX XXX XXX XXX' }),
      );
    });
  });

  describe('removeGiftcard', () => {
    it('should make request to DELETE /api/cart/giftcards/:gid', async () => {
      await api.cart.removeGiftcard('5c15505200c7d14d851e510f');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/cart/giftcards/5c15505200c7d14d851e510f`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
    });
  });

  describe('getShippingRates', () => {
    it('should make request to GET /api/cart/shipment-rating', async () => {
      await api.cart.getShippingRates();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/shipment-rating`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('submitOrder', () => {
    it('should make request to POST /api/cart/order', async () => {
      await api.cart.submitOrder();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/order`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
    });
  });

  describe('getOrder', () => {
    it('should make request to GET /api/cart/order', async () => {
      await api.cart.getOrder();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/order`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should make request to GET /api/cart/order?checkout_id=:checkout_id', async () => {
      await api.cart.getOrder('specific');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/cart/order?checkout_id=specific`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('getSettings', () => {
    it('should make request to GET /cart/settings', async () => {
      await api.cart.getSettings();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/cart/settings`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });
});
