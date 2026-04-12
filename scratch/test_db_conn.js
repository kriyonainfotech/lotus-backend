import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const mongoURI = process.env.MONGODB_URI;

console.log('Testing connection to:', mongoURI ? 'URI found' : 'URI NOT FOUND');

if (!mongoURI) {
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas locally');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
