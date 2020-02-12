export default (state = null, action) => {
  switch (action.type) {
    case 'SET_CART':
    case 'ADD_ITEM':
    case 'REMOVE_ITEM':
    case 'SUBMIT_ORDER':
      return action.payload;
    default:
      return state;
  }
};
