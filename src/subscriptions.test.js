import api from './api';

describe('cart', () => {
  beforeEach(() => {
    api.init('test', 'pk_test');
  });

  describe('get', () => {
    it('should make request to GET /subscriptions', async () => {
      await api.subscriptions.get();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });

    it('should make request to GET /subscriptions/id', async () => {
      await api.subscriptions.get('12345');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions/12345`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'get');
    });
  });

  describe('create', () => {
    it('should make request to POST /subscriptions', async () => {
      await api.subscriptions.create({ product_id: '123' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ product_id: '123' }),
      );
    });
  });

  describe('update', () => {
    it('should make request to PUT /subscriptions/id', async () => {
      await api.subscriptions.update('12345', { product_id: '123' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(`https://test.swell.store/api/subscriptions/12345`);
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ product_id: '123' }),
      );
    });
  });

  describe('addItem', () => {
    it('should make request to POST /subscriptions/id/items', async () => {
      await api.subscriptions.addItem('12345', { product_id: '123' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/subscriptions/12345/items`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'post');
      expect(fetch.mock.calls[0][1]).toHaveProperty(
        'body',
        JSON.stringify({ product_id: '123' }),
      );
    });
  });

  describe('setItems', () => {
    it('should make request to PUT /subscriptions/id/items', async () => {
      await api.subscriptions.setItems('12345', [{ quantity: 2 }]);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/subscriptions/12345/items`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify([{ quantity: 2 }]));
    });
  });

  describe('updateItem', () => {
    it('should make request to PUT /subscriptions/id/items/id', async () => {
      await api.subscriptions.updateItem('12345', '67890', { quantity: 2 });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/subscriptions/12345/items/67890`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'put');
      expect(fetch.mock.calls[0][1]).toHaveProperty('body', JSON.stringify({ quantity: 2 }));
    });
  });

  describe('removeItem', () => {
    it('should make request to DELETE /subscriptions/id/items/id', async () => {
      await api.subscriptions.removeItem('12345', '67890');

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual(
        `https://test.swell.store/api/subscriptions/12345/items/67890`,
      );
      expect(fetch.mock.calls[0][1]).toHaveProperty('method', 'delete');
    });
  });
});
