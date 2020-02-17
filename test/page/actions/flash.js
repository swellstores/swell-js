export default {
  error(message) {
    return setMessage('FLASH_ERROR', message);
  },

  warning(message) {
    return setMessage('FLASH_WARNING', message);
  },

  success(message) {
    return setMessage('FLASH_SUCCESS', message);
  },

  clear() {
    return {
      type: 'FLASH_CLEAR',
    };
  },
};

let flashTimer = null;

function setMessage(type, message) {
  return (dispatch) => {
    dispatch({
      type,
      payload: message,
    });
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => dispatch({ type: 'FLASH_CLEAR' }), 5000);
  };
}
