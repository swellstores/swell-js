export default {
  set(id, order) {
    return (dispatch) => {
      dispatch({
        type: 'SET_CHECKOUT',
        payload: {
          id,
          order,
        },
      });
    };
  },
};
