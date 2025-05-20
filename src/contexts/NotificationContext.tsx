import React, { createContext, useContext, useState, ReactNode } from 'react';
import NotificationBar, { NotificationType } from '../components/common/NotificationBar';

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, clearNotification }}>
      {notification && (
        <NotificationBar
          type={notification.type}
          message={notification.message}
          onDismiss={clearNotification}
        />
      )}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};