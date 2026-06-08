import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // 👈 TRACKING INITIALIZATION

  // useEffect runs ONCE when the app boots up
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from local storage:", error);
    } finally {
      // Always set loading to false, even if local storage is empty
      setLoadingAuth(false); 
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AppContext.Provider value={{ user, login, logout, loadingAuth }}>
      {children}
    </AppContext.Provider>
  );
};