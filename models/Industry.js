import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String, // String representation of an emoji or a URL to an icon
    default: '🏢'
  }
}, { timestamps: true });

export default mongoose.model('Industry', industrySchema);
