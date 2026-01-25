import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import websocketService from '../services/websocket';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Get icon and color based on notification type
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return { icon: 'CheckCircle', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'error':
        return { icon: 'AlertCircle', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'warning':
        return { icon: 'AlertTriangle', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      default:
        return { icon: 'Info', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    }
  };

  // Handle new notification
  const handleNewNotification = useCallback((notification) => {
    const formattedNotification = {
      ...notification,
      timestamp: formatTimestamp(notification.timestamp),
      formattedDate: new Date(notification.timestamp).toLocaleString(),
      ...getNotificationStyle(notification.type)
    };

    setNotifications(prev => [formattedNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    const toastOptions = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, { ...toastOptions, title: notification.title });
        break;
      case 'error':
        toast.error(notification.message, { ...toastOptions, title: notification.title });
        break;
      case 'warning':
        toast.warning(notification.message, { ...toastOptions, title: notification.title });
        break;
      default:
        toast.info(notification.message, { ...toastOptions, title: notification.title });
    }
  }, []);

  // Connect WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        websocketService.connect(token);

        // Listen for notifications
        websocketService.on('notification', handleNewNotification);

        return () => {
          websocketService.off('notification', handleNewNotification);
        };
      }
    } else {
      websocketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, handleNewNotification]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    websocketService.markNotificationRead(notificationId);
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(notification => notification.id !== notificationId);
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

