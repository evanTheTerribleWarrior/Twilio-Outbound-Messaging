import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { loginSuccess } from '../../../Redux/slices/authSlice';
import { authenticateUser } from '../../../Utils/functions';
import { Typography, TextField, Button, Container } from '@mui/material';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authFailMessage, setAuthFailMessage] = useState(null);

  const handleLogin = async (username, password) => {
    const data = await authenticateUser(
      {
        username: username,
        password: password
      }
    )
    if(data.success){
      dispatch(loginSuccess(true))
      setAuthFailMessage(null)
      navigate("/build", { replace: true })
    }
    else {
      setAuthFailMessage(data.message)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  };

  const centerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  return (
    <div style={containerStyles}>
      <div style={centerStyles}>
    <Container>
      <form onSubmit={handleFormSubmit}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
      </form>
      {
        authFailMessage && (
          <Typography variant="body1" color="error" sx={{mt: 2}} align="center">
            {authFailMessage}
          </Typography>
        )
      }
    </Container>
    </div>
    </div>
  );
};

export default Login;
