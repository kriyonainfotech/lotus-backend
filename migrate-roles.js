import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lotus_app';

const migrateUsers = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for migration');

    const result = await User.updateMany(
      { role: { $exists: false } }, 
      { $set: { role: 'user' } }
    );

    console.log(`Updated ${result.modifiedCount} users with default 'user' role`);
    
    // Also make sure at least one admin exists if needed, 
    // but the request only asked to add 'user' role to existing users.
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();
