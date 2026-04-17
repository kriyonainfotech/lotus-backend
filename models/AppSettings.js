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
  privacyPolicy: {
    type: String,
    default: ''
  },
  termsAndConditions: {
    type: String,
    default: ''
  },
  aboutUs: {
    type: String,
    default: ''
  },
  faq: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  customerCareEmail: {
    type: String,
    default: 'support@lotus.digital'
  },
  inviteMessage: {
    type: String,
    default: 'Create professional business designs with Lotus! Download now: '
  },
  storeLink: {
    type: String,
    default: 'https://lotus.digital/download'
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

export default AppSettings;
