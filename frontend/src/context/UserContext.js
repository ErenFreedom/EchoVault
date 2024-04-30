import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);

  

  return (
    <UserContext.Provider value={{ isPremium, setIsPremium }}>
      {children}
    </UserContext.Provider>
  );
};
