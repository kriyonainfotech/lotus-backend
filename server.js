import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import appSettingsRoutes from './routes/appSettingsRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import Industry from './models/Industry.js';
import { initFirebase } from './config/firebaseAdmin.js';

dotenv.config();

// Initialize Firebase Admin SDK
initFirebase();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
const allowedOrigins = [
  'https://lotus-delta-six.vercel.app', 
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow local network IPs (192.168.x.x, 10.x.x.x, etc.) for mobile testing
    const isLocalNetwork = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/.test(origin);
    
    if (allowedOrigins.includes(origin) || isLocalNetwork) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Global Logger for Debugging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', appSettingsRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/notifications', notificationRoutes);

// Database Connection
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables.');
  console.log('Falling back to local mongodb for development check...');
}

mongoose.connect(mongoURI || 'mongodb://127.0.0.1:27017/lotus_app')
  .then(async () => {
    console.log('Successfully connected to MongoDB');
    await seedIndustries();
  })
  .catch((err) => {
    console.error('MONGODB CONNECTION ERROR:', err.message);
    if (err.message.includes('buffering timed out')) {
      console.error('Tip: Check if your database URI is correct and if your network allows the connection.');
    }
  });

const seedIndustries = async () => {
  try {
    const count = await Industry.countDocuments();
    if (count === 0) {
      const data = [
        { name: 'Real Estate', icon: '🏢' },
        { name: 'Education', icon: '🎓' },
        { name: 'Mobile Store', icon: '📱' },
        { name: 'Clothes', icon: '👗' },
        { name: 'Jewellery', icon: '💍' },
        { name: 'Tour and Travels', icon: '✈️' },
        { name: 'Hospital and Clinic', icon: '🏥' },
        { name: 'Restaurant', icon: '🍽️' },
      ];
      await Industry.insertMany(data);
      console.log('Dummy industries seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding industries:', error);
  }
};

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Lotus App Backend API is running successfully' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('--- CRITICAL UNHANDLED ERROR ---');
  console.error(err.stack); // Show full stack trace
  console.error('--------------------------------');
  
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
