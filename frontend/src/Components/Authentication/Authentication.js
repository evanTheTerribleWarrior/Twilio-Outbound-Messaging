import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from "react-router-dom";
import { checkAuthentication } from '../../Utils/functions';
import { setAuthenticated, logout } from '../../Redux/slices/authSlice';


const Auth = ({ children }) => {
    const dispatch = useDispatch();
    const currentIsAuthenticated = useSelector((state) => state.auth.isAuthenticated)
    const [isAuthenticated, setIsAuthenticated] = useState(currentIsAuthenticated)

    useEffect(() => {
        async function checkAuth() {
            const checkAuthenticated = await checkAuthentication();
            console.log(checkAuthenticated)
            if (checkAuthenticated.isAuthenticated) dispatch(setAuthenticated(true));
            else dispatch(logout());
        }
        checkAuth()
    },[dispatch])
    
    
  
  return (
    <>
        {
            currentIsAuthenticated ? (
                <div>{ children }</div>
            ) :
            (
                <Navigate to="/login"/>
            )
        } 
    </>
  );
};

export default Auth;