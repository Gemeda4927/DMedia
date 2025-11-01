'use client';

import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiXCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

interface NotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const { id, type, title, message, duration = 5000 } = notification;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="w-5 h-5" />,
    error: <FiXCircle className="w-5 h-5" />,
    warning: <FiAlertCircle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
    warning: 'bg-yellow-600 border-yellow-500',
    info: 'bg-blue-600 border-blue-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`${styles[type]} border-l-4 rounded-lg shadow-lg p-4 mb-4 max-w-md w-full`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 text-white">{icons[type]}</div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
          )}
          <p className="text-sm text-white">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="ml-4 flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={onClose}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

