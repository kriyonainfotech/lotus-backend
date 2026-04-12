import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Industry from './models/Industry.js';
import { initFirebase } from './config/firebaseAdmin.js';

dotenv.config();

// Initialize Firebase Admin SDK
initFirebase();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: ['https://lotus-delta-six.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

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
  console.error('Unhandled Error:', err);
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
