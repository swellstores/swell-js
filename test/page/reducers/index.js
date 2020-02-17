import { combineReducers } from 'redux';
import api from './api';
import cart from './cart';
import user from './user';
import flash from './flash';

const reducer = combineReducers({ api, cart, user, flash });

export default reducer;
