import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');

    if (storedToken && storedUserId && storedUserName) {
      setToken(storedToken);
      setUserId(storedUserId);
      setUserName(storedUserName);
    }
    setLoading(false);
  }, []);

  const login = (userToken, userId, userName) => {
    setToken(userToken);
    setUserId(userId);
    setUserName(userName);

    localStorage.setItem('token', userToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');

    setToken(null);
    setUserId(null);
    setUserName('');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userId, userName, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};