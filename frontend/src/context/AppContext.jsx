import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Bulletproof Local Storage Check
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      // Prevent crash if the literal string "undefined" gets saved
      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from local storage:", error);
    }
    return null; // Fallback to no user if anything goes wrong
  });

  const login = (userData, token) => {
    setUser(userData);
    
    // Safely store user data. If userData is somehow undefined, it won't break things next time.
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
    <AppContext.Provider value={{ user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};