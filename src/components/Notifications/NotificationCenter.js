import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock,
  User,
  FileText,
  Calendar
} from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Application Submitted',
      message: 'John Doe\'s passport application has been successfully submitted.',
      timestamp: '2 minutes ago',
      isRead: false,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Appointment Reminder',
      message: 'Sarah Wilson has an appointment in 30 minutes.',
      timestamp: '15 minutes ago',
      isRead: false,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      id: 3,
      type: 'info',
      title: 'New Customer Registration',
      message: 'Mike Johnson has registered as a new customer.',
      timestamp: '1 hour ago',
      isRead: true,
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 4,
      type: 'error',
      title: 'Document Missing',
      message: 'Birth certificate application is missing required documents.',
      timestamp: '2 hours ago',
      isRead: true,
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      id: 5,
      type: 'info',
      title: 'Visit Completed',
      message: 'Lisa Davis\'s consultation visit has been completed.',
      timestamp: '3 hours ago',
      isRead: true,
      icon: Calendar,
      color: 'text-blue-600'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type) => {
    const notification = notifications.find(n => n.type === type);
    return notification ? notification.icon : Info;
  };

  const getNotificationColor = (type) => {
    const notification = notifications.find(n => n.type === type);
    return notification ? notification.color : 'text-gray-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 ${notification.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-600"
                                title="Delete notification"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full btn-outline text-sm">
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

