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
  // SMTP Configuration
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  smtpFromEmail: { type: String, default: '' },
  // Email Templates
  welcomeEmailTemplate: {
    subject: { type: String, default: 'Welcome to Lotus!' },
    body: { type: String, default: 'Hi {{name}}, Welcome to Lotus! We are excited to have you onboard.' }
  },
  purchaseEmailTemplate: {
    subject: { type: String, default: 'Plan Activated - Lotus Pro' },
    body: { type: String, default: 'Hi {{name}}, Your {{planName}} has been activated successfully!' }
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

export default AppSettings;
