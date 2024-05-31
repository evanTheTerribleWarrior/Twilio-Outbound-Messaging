import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, HashRouter } from "react-router-dom";
window.onbeforeunload = () => { return "" };
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <HashRouter>
      <App />
    </HashRouter>
  
);
/*
ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  document.getElementById('root')   
);*/
