// src/context/NotificationContext.js
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notificationCount, setNotificationCount] = useState(0);

    // Function to increment notification count, could be more complex
    const addNotification = () => {
        setNotificationCount(prevCount => prevCount + 1);
    };

    const resetNotificationCount = () => {
        setNotificationCount(0);
    };

    return (
        <NotificationContext.Provider value={{ notificationCount, addNotification, resetNotificationCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
