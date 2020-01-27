import { combineReducers } from 'redux';
import api from './api';
import checkout from './checkout';

const reducer = combineReducers({ api, checkout });

export default reducer;
