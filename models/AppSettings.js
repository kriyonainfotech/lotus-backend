import mongoose from 'mongoose';

const appSettingsSchema = new mongoose.Schema({
  heroHeadline1: { 
    type: String, 
    default: 'INTEGRATED ALL-IN-ONE' 
  },
  heroHeadline2: { 
    type: String, 
    default: 'BUSINESS SOLUTIONS' 
  },
  marqueeText: [{ 
    type: String 
  }],
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

export default AppSettings;
