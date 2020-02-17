import api from '../../../src/api';
import config from '../config';

export default {
  init({ store = config.store, key = config.key, url = config.url, vaultUrl = config.vaultUrl }) {
    return (dispatch) => {
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
