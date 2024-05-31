import {createSlice} from '@reduxjs/toolkit'

  const initialState = {
    isAuthenticated: false
  };
  
  const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      logout: (state) => {
        state.isAuthenticated = false;
      },
      setAuthenticated(state, action) {
        state.isAuthenticated = action.payload;
      }
    },
  });
  
  export const { logout, setAuthenticated } = authSlice.actions;
  export default authSlice.reducer;