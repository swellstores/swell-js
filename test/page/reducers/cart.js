export default (state = null, action) => {
  switch (action.type) {
    case 'SET_CART':
    case 'ADD_ITEM':
    case 'REMOVE_ITEM':
    case 'SUBMIT_ORDER':
    case 'UPDATE_CART':
      return action.payload;
    default:
      return state;
  }
};
