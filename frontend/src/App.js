import React from 'react';
import { Container } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Redux/store';
import MainAppBar from './Components/MainAppBar/MainAppBar';
import Login from './Components/Authentication/Login/Login';
import Auth from './Components/Authentication/Authentication';
import MainBuilder from './Components/MainBuilder/MainBuilder';

const App = () => {

  return(
    <Provider store={store}> 
        <MainAppBar/>
        <Container style={{ marginTop: '60px', minWidth: "100%",
        height: "100vh", }}>
        <Routes>
            <Route exact path="/build" element={<Auth><MainBuilder/></Auth>} />
            <Route exact path="/" element={<Auth><Navigate to="/build" /></Auth>} />
            <Route exact path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </Container>
    </Provider>
  );
};

export default App;