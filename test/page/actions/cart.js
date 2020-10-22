export default {
  initCart() {
    return async (dispatch, getState) => {
      const { api } = getState();
      const cart = await api.cart.get();
      dispatch({
        type: 'SET_CART',
        payload: cart,
      });
    };
  },

  addItem(product) {
    return async (dispatch, getState) => {
      const { api } = getState();
      const cart = await api.cart.addItem(product);
      dispatch({
        type: 'ADD_ITEM',
        payload: cart,
      });
    };
  },

  removeItem(itemId) {
    return async (dispatch, getState) => {
      const { api } = getState();
      const cart = await api.cart.removeItem(itemId);
      dispatch({
        type: 'REMOVE_ITEM',
        payload: cart,
      });
    };
  },

  update(values) {
    return async (dispatch, getState) => {
      const { api } = getState();
      const cart = await api.cart.update(values);
      dispatch({
        type: 'UPDATE_CART',
        payload: cart,
      });
    };
  },

  submitOrder() {
    return async (dispatch, getState) => {
      dispatch({
        type: 'SUBMIT_ORDER',
        payload: null,
      });
      const { api } = getState();
      const order = await api.cart.submitOrder();
      return order;
    };
  },
};
