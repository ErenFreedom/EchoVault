// src/context/UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);

  // You can set isPremium based on authentication status, JWT token, etc.
  // For this example, we'll just use a hardcoded value
  // Ideally, you'd decode your JWT or fetch user info to set this

  return (
    <UserContext.Provider value={{ isPremium, setIsPremium }}>
      {children}
    </UserContext.Provider>
  );
};
