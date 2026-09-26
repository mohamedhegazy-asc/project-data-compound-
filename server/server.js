const path = require('path');
const dns = require('dns');

// Configure Google & Cloudflare DNS for SRV resolution fallback
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const residentRoutes = require('./routes/residentRoutes');
const parcelRoutes = require('./routes/parcelRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mivida';

// Enable CORS - allow all origins for Vercel deployment
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: File uploads are now handled by Cloudinary (see config/cloudinary.js)

// Database connection helper with connection promise caching for Serverless environments (Vercel)
let connectionPromise = null;
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!connectionPromise) {
    console.log('جاري الاتصال بقاعدة البيانات...');
    connectionPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })
      .then(conn => {
        console.log('تم الاتصال بقاعدة بيانات MongoDB بنجاح.');
        return conn;
      })
      .catch(err => {
        connectionPromise = null;
        console.error('⚠️ تحذير: فشل الاتصال بقاعدة البيانات:', err.message);
        throw err;
      });
  }
  return connectionPromise;
}

// Ensure database is connected before handling any request
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('Database connection failed for request:', err.message);
    }
  }
  next();
});

// API Routes (supports both /api/path and /path for Vercel rewrites)
app.use(['/api/residents', '/residents'], residentRoutes);
app.use(['/api/parcels', '/parcels'], parcelRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ 
    status: mongoose.connection.readyState === 1 ? 'OK' : 'NO_DATABASE', 
    message: 'سيرفر ميفيدا يعمل بنجاح',
    databaseConnected: mongoose.connection.readyState === 1
  });
});

// Serve frontend in production build
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}


// Global error handling middleware for JSON error responses
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({
    message: err.message || 'حدث خطأ داخلي في السيرفر',
    error: process.env.NODE_ENV === 'production' ? err.message : err.stack
  });
});

// Connect immediately on startup
connectDB();

// Start HTTP listener only when running as a standalone server (not on Vercel Serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`السيرفر يعمل الآن على المنفذ: http://localhost:${PORT}`);
  });
}

module.exports = app;


