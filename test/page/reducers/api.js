export default (state = null, action) => {
  switch (action.type) {
    case 'INIT_API':
      return action.payload;
    default:
      return state;
  }
};
