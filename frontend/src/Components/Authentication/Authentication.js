import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from "react-router-dom";
import { checkAuthentication } from '../../Utils/functions';

const Auth = ({ children }) => {

    const currentIsAuthenticated = useSelector((state) => state.auth.isAuthenticated)

    const [isAuthenticated, setIsAuthenticated] = useState(currentIsAuthenticated)

    useEffect(() => {
        async function check() {
            const checkAuthenticated = await checkAuthentication();
            if (checkAuthenticated.isAuthenticated) setIsAuthenticated(true)
            else setIsAuthenticated(false)
            return
        }
        check()
    },[])
    
    
  
  return (
    <>
        {
            isAuthenticated ? (
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