import api from '../../../src/api';
import config from '../config';

export default {
  init(store = config.store, key = config.key) {
    return (dispatch) => {
      const { url, vaultUrl } = config;
      if (store && key) {
        api.init(store, key, {
          url,
          vaultUrl,
        });
        dispatch({
          type: 'INIT_API',
          payload: api,
        });
      } else {
        dispatch({
          type: 'INIT_API',
          payload: null,
        });
      }
    };
  },
};
