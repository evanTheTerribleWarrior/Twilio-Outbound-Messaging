import { combineReducers } from 'redux';
import authReducer from './slices/authSlice'
import csvDataReducer from './slices/csvDataSlice';
import messagingReducer from './slices/messagingSlice'
import settingsReducer from './slices/settingsSlice';
import actionReducer from './slices/actionSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  csvDataStructure: csvDataReducer,
  messagingStructure: messagingReducer,
  settingsStructure: settingsReducer,
  actionStructure: actionReducer
});

export default rootReducer;
