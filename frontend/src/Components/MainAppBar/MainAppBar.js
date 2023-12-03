import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Redux/slices/authSlice';
import { removeJWT } from '../../Utils/functions';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const MainAppBar = () => {

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if(isAuthenticated){
      dispatch(logout(isAuthenticated))
      const res = await removeJWT();
      console.log(res)
      navigate("/login");
    }
  }

  return (
      <AppBar position="absolute">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Outbound Messaging App
          </Typography>
          { isAuthenticated && (<Button color="inherit" onClick={() => handleLogout()}>Logout</Button>)}
        </Toolbar>
        
      </AppBar>
  );
}

export default MainAppBar;