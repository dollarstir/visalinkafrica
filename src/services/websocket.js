import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    // Build WebSocket base URL:
    // - In production, REACT_APP_API_URL is usually like "https://domain.com/api"
    //   but Socket.IO expects the server origin (e.g. "https://domain.com"), not a namespace.
    let serverUrl;
    const apiUrl = process.env.REACT_APP_API_URL;

    if (apiUrl) {
      try {
        const u = new URL(apiUrl);
        // Use origin only (protocol + host + optional port)
        serverUrl = `${u.protocol}//${u.host}`;
      } catch (e) {
        // Fallback: strip a trailing "/api" if present
        serverUrl = apiUrl.replace(/\/api\/?$/, '');
      }
    } else if (typeof window !== 'undefined' && window.location) {
      serverUrl = window.location.origin;
    } else {
      serverUrl = 'http://localhost:5001';
    }

    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      // Socket.IO server on backend uses the default "/socket.io" path and root namespace ("/")
      path: '/socket.io'
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.emit('error', error);
    });

    // Listen for notifications
    this.socket.on('notification', (notification) => {
      this.emit('notification', notification);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  markNotificationRead(notificationId) {
    if (this.socket?.connected) {
      this.socket.emit('mark_notification_read', notificationId);
    }
  }
}

export default new WebSocketService();

