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
  saveState({
    auth: {
      isAuthenticated: state.auth.isAuthenticated
    }
  });
}, 1000));


export default store;