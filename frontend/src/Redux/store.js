import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import throttle from 'lodash/throttle';
import { loadState, saveState } from './localStorage';

const persistedState = loadState();

const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState
});

store.subscribe(throttle(() => {
  const state = store.getState();
  saveState({"isAuthenticated": state.auth.isAuthenticated});
  //saveState(state)
}, 1000));


export default store;