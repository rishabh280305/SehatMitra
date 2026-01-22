const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require('./config/database');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Connect to database (async in serverless, will reconnect on each cold start)
let dbConnection = null;
const initDB = async () => {
  if (!dbConnection) {
    dbConnection = connectDB().catch(err => {
      console.error('DB Connection failed:', err);
      return null;
    });
  }
  return dbConnection;
};

// Initialize DB connection (non-blocking)
initDB();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Sanitize data to prevent MongoDB injection
app.use(hpp()); // Prevent HTTP parameter pollution

// CORS configuration - Allow all Vercel domains
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Vercel domains and localhost
    const allowedOrigins = [
      'https://sehatmitra-patient.vercel.app',
      'https://sehatmitra-asha.vercel.app',
      'https://sehatmitra-doctor.vercel.app',
      'https://sehatmitra-landing.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3004'
    ];
    
    // Check if origin matches or ends with vercel.app
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Enable pre-flight across-the-board
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Debug logging for all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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
    version: process.env.API_VERSION || 'v1',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test registration endpoint
app.post('/api/v1/test/register', (req, res) => {
  console.log('===== TEST REGISTER =====');
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  res.json({
    success: true,
    message: 'Test endpoint received request',
    received: req.body
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

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
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
}

module.exports = app;
