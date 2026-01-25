/**
 * Notification Service
 * Handles WebSocket notifications for real-time updates
 */

let io = null;

/**
 * Initialize notification service with Socket.io instance
 */
const initialize = (socketIO) => {
  io = socketIO;
};

/**
 * Send notification to a specific user
 * @param {number} userId - User ID to send notification to
 * @param {Object} notification - Notification object
 */
const notifyUser = (userId, notification) => {
  if (!io) {
    console.warn('Socket.io not initialized. Cannot send notification.');
    return;
  }

  // Emit to user's room
  io.to(`user_${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });

  console.log(`Notification sent to user ${userId}:`, notification.title);
};

/**
 * Send notification to all users (broadcast)
 * @param {Object} notification - Notification object
 */
const notifyAll = (notification) => {
  if (!io) {
    console.warn('Socket.io not initialized. Cannot send notification.');
    return;
  }

  io.emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });

  console.log('Broadcast notification sent:', notification.title);
};

/**
 * Send notification to users with specific role
 * @param {string} role - Role to send notification to
 * @param {Object} notification - Notification object
 */
const notifyRole = (role, notification) => {
  if (!io) {
    console.warn('Socket.io not initialized. Cannot send notification.');
    return;
  }

  io.to(`role_${role}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });

  console.log(`Notification sent to role ${role}:`, notification.title);
};

/**
 * Create notification object
 */
const createNotification = (type, title, message, data = {}) => {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type, // 'info', 'success', 'warning', 'error'
    title,
    message,
    data,
    read: false
  };
};

module.exports = {
  initialize,
  notifyUser,
  notifyAll,
  notifyRole,
  createNotification
};

