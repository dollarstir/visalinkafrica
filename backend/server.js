const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize notification service
const notificationService = require('./services/notificationService');
notificationService.initialize(io);

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join user-specific room
  socket.join(`user_${socket.userId}`);
  
  // Join role-specific room
  if (socket.userRole) {
    socket.join(`role_${socket.userRole}`);
  }

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });

  // Handle mark notification as read
  socket.on('mark_notification_read', (notificationId) => {
    // You can implement notification read tracking here if needed
    console.log(`Notification ${notificationId} marked as read by user ${socket.userId}`);
  });
});

// Use port 5001 by default since macOS uses 5000 for AirPlay Receiver
const PORT = process.env.PORT || 5001;

// Behind nginx reverse proxy – trust first proxy so rate limiting and IPs work
app.set('trust proxy', 1);

// Security middleware - configure helmet for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow all origins in development for easier testing
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.FRONTEND_URL 
      ? [process.env.FRONTEND_URL]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    // In development, allow all origins for easier debugging
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}));

// Body parsing middleware - must come before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/permissions', require('./routes/permissions'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/visits', require('./routes/visits'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/services', require('./routes/services'));
app.use('/api/service-categories', require('./routes/serviceCategories'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/website', require('./routes/website'));

// Auto-run database migrations on startup (production only)
const runMigrationsOnStartup = async () => {
  if (process.env.NODE_ENV === 'production' || process.env.AUTO_MIGRATE === 'true') {
    try {
      console.log('Running database migrations...');
      const { createTables } = require('./scripts/migrate');
      await createTables();
      console.log('Database migrations completed successfully!');
    } catch (error) {
      console.error('Database migration failed:', error);
      // Don't exit - let the server start anyway, but log the error
    }
  }
};

// Initialize settings service on startup
const settingsService = require('./services/settingsService');
settingsService.initialize().catch(err => {
  console.error('Failed to initialize settings service:', err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VisaLink Africa API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server with auto-migration
const startServer = async () => {
  // Run migrations before starting server
  await runMigrationsOnStartup();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`WebSocket server initialized`);
  });
};

startServer();

