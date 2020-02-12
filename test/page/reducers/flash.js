const initialState = {
  error: null,
  warning: null,
  success: null,
  visible: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'FLASH_ERROR':
      return {
        error: action.payload,
        visible: true,
      };

    case 'FLASH_WARNING':
      return {
        warning: action.payload,
        visible: true,
      };

    case 'FLASH_SUCCESS':
      return {
        success: action.payload,
        visible: true,
      };

    case 'FLASH_CLEAR':
      return {
        ...initialState,
      };

    default:
      return state;
  }
};
