import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { admin, initFirebase } from './config/firebaseAdmin.js';
import User from './models/User.js';

dotenv.config();
initFirebase();

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lotus_app';

const createAdmin = async () => {
  const email = 'admin@gmail.com';
  const password = '123456';

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
      console.log('User already exists in Firebase');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        firebaseUser = await admin.auth().createUser({
          email,
          password,
          displayName: 'Administrator',
        });
        console.log('Created new user in Firebase');
      } else {
        throw e;
      }
    }

    // Update or Create in MongoDB
    const userDoc = await User.findOneAndUpdate(
      { firebaseUid: firebaseUser.uid },
      { 
        email: firebaseUser.email,
        name: 'Administrator',
        role: 'admin',
        isProfileComplete: true
      },
      { upsert: true, new: true }
    );

    console.log('Admin user successfully registered/updated in MongoDB:');
    console.log(`Email: ${userDoc.email}`);
    console.log(`Role: ${userDoc.role}`);
    console.log(`UID: ${userDoc.firebaseUid}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
