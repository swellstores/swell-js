import config from '../config';

export default {
  fetch() {
    return async (dispatch, getState) => {
      const { api } = getState();
      const user = await api.account.get();
      dispatch({
        type: 'USER_FETCH',
        payload: user,
      });
    };
  },

  login({ email = config.email, password = config.password }) {
    return async (dispatch, getState) => {
      const { api } = getState();
      const user = await api.account.login(email, password);
      dispatch({
        type: 'USER_LOGIN',
        payload: user,
      });
    };
  },

  logout() {
    return async (dispatch, getState) => {
      const { api } = getState();
      await api.account.logout();
      dispatch({
        type: 'USER_LOGOUT',
        payload: null,
      });
    };
  },
};
