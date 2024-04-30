import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";


const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.id; 
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const ThemeProvider = ({ children }) => {
  const userId = getUserIdFromToken();
  const [theme, setTheme] = useState(localStorage.getItem(`theme-${userId}`) || 'white');

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`theme-${userId}`, theme);
    }
    document.body.className = theme; 
  }, [theme, userId]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
