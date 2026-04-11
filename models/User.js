import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
  },
  name: {
    type: String,
    default: ''
  },
  designation: {
    type: String,
    default: ''
  },
  dob: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
