'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationContainer, Notification, NotificationType } from '../components/Notification';

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (type: NotificationType, message: string, title?: string, duration?: number) => {
      const id = `${Date.now()}-${Math.random()}`;
      const notification: Notification = {
        id,
        type,
        message,
        title,
        duration,
      };
      setNotifications((prev) => [...prev, notification]);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, title?: string, duration?: number) => {
      showNotification('success', message, title, duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, title?: string, duration?: number) => {
      showNotification('error', message, title, duration);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title?: string, duration?: number) => {
      showNotification('warning', message, title, duration);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string, duration?: number) => {
      showNotification('info', message, title, duration);
    },
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
};

