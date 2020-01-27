import api from '../../../src/api';
import config from '../config';

export default {
  init(store = config.store, key = config.key) {
    return (dispatch) => {
      const { url, vaultUrl } = config;
      api.init(store, key, {
        url,
        vaultUrl,
      });

      dispatch({
        type: 'INIT_API',
        payload: api,
      });
    };
  },
};
