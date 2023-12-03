import {createSlice} from '@reduxjs/toolkit'

  const initialState = {
    isAuthenticated: false
  };
  
  const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      loginSuccess: (state, action) => {
        state.isAuthenticated = true
      },
      logout: (state) => {
        state.isAuthenticated = false;
      },
    },
  });
  
  export const { loginSuccess, logout } = authSlice.actions;
  export default authSlice.reducer;