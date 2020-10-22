export default (state = null, action) => {
  switch (action.type) {
    case 'USER_FETCH':
    case 'USER_LOGIN':
    case 'USER_LOGOUT':
      return action.payload;
    default:
      return state;
  }
};
