const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require('./config/database');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Connect to database
connectDB();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Sanitize data to prevent MongoDB injection
app.use(hpp()); // Prevent HTTP parameter pollution

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SehatMitra API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.API_VERSION || 'v1'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SehatMitra - Rural Health & Telemedicine Ecosystem API',
    documentation: '/api/v1/docs',
    health: '/health',
    version: process.env.API_VERSION || 'v1'
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';

// Mount routes
app.use(`/api/${apiVersion}/auth`, require('./routes/auth.routes'));
app.use(`/api/${apiVersion}/ai`, require('./routes/ai.routes'));
app.use(`/api/${apiVersion}/patients`, require('./routes/patient.routes'));
app.use(`/api/${apiVersion}/consultations`, require('./routes/consultation.routes'));
app.use(`/api/${apiVersion}/calls`, require('./routes/call.routes'));
app.use(`/api/${apiVersion}/doctors`, require('./routes/doctor.routes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║          🏥  SehatMitra API Server Started  🏥            ║');
  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Environment:  ${process.env.NODE_ENV?.padEnd(42)} ║`);
  console.log(`║  Port:         ${PORT.toString().padEnd(42)} ║`);
  console.log(`║  URL:          http://localhost:${PORT.toString().padEnd(30)} ║`);
  console.log(`║  API Version:  ${(process.env.API_VERSION || 'v1').padEnd(42)} ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');

// Initialize Socket.IO for real-time calling
const { initializeSocket } = require('./socket/callSocket');
initializeSocket(server);
console.log('║  WebSocket:    ✓ Initialized for voice calls              ║');
console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  📍 Endpoints:                                             ║');
  console.log(`║     Health:    http://localhost:${PORT}/health`.padEnd(61) + '║');
  console.log(`║     Auth:      http://localhost:${PORT}/api/${apiVersion}/auth`.padEnd(61) + '║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('🔌 Process terminated');
  });
});

module.exports = app;
