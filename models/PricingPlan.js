import mongoose from 'mongoose';

const pricingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  /** Price in INR (rupees) — converted to paise for Razorpay at checkout */
  price: {
    type: Number,
    required: true,
    min: 1,
  },
  durationDays: {
    type: Number,
    required: true,
    min: 1,
  },
  badge: {
    type: String,
    default: '',
  },
  features: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model('PricingPlan', pricingPlanSchema);
