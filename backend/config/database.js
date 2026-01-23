const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection in serverless
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('♻️  Using cached database connection');
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    throw new Error('MONGODB_URI is not defined');
  }

  console.log('🔄 Attempting MongoDB connection...');
  console.log('Connection string starts with:', process.env.MONGODB_URI.substring(0, 20));

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      cachedConnection = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    cachedConnection = null;
    throw error; // Don't exit in serverless
  }
};

module.exports = connectDB;
