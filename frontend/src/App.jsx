import React, { useEffect, useState } from 'react';
import AuthPage from './AuthUI/AuthPage';
import PrivateRoutes from './utils/PrivateRoutes';
import { AuthProvider } from './utils/AuthContext';
import {BrowserRouter as Router,Route,Routes} from "react-router-dom"
import Home from './Home';

function App() {
 
  return (

    <Router>
    <AuthProvider>
      {" "}
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/home" element={<Home/>} />
          
        </Route>
        <Route path="/" element={<AuthPage/>} />
        <Route path="/login" element={<AuthPage/>} />
      </Routes>
    </AuthProvider>
  </Router>

     
  );
}

export default App;
