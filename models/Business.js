import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Business', businessSchema);
