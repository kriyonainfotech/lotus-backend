import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import Industry from './models/Industry.js';
import { initFirebase } from './config/firebaseAdmin.js';

dotenv.config();

// Initialize Firebase Admin SDK
initFirebase();

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/upload', uploadRoutes);

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lotus_app';
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Successfully connected to MongoDB');
    await seedIndustries();
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

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

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
