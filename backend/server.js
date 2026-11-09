const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure MongoDB connection for Serverless environments (Vercel)
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not configured in environment variables');
      return res.status(500).json({ 
        message: 'MONGODB_URI belum ditambahkan di Environment Variables Vercel' 
      });
    }
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected (Serverless)');
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err);
      return res.status(500).json({ 
        message: 'Koneksi MongoDB gagal (Cek IP Whitelist 0.0.0.0/0 di Atlas)', 
        error: err.message 
      });
    }
  }
  next();
});

// Root / Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Solace Coffee API is running successfully!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// MongoDB Connection for local development
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected: solace_coffee'))
    .catch(err => console.error('❌ MongoDB Error:', err));
}

mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

// Only start listening when executed directly (node server.js), not when imported or in Vercel Serverless
if (require.main === module && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Solace Coffee API running on port ${PORT}`);
  });
}

module.exports = app;
