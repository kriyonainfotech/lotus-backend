import AppSettings from '../models/AppSettings.js';

// Get app settings (singleton)
export const getAppSettings = async (req, res) => {
  try {
    let settings = await AppSettings.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = new AppSettings({
        marqueeText: [
          "Welcome to Lotus Business Solutions",
          "Schedule your first template today!"
        ]
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching app settings', error: error.message });
  }
};

// Update app settings
export const updateAppSettings = async (req, res) => {
  try {
    let settings = await AppSettings.findOne();
    if (!settings) {
      settings = new AppSettings(req.body);
    } else {
      // Manually assign each field so Mongoose can track changes
      const {
        heroHeadline1, heroHeadline2, marqueeText,
        privacyPolicy, termsAndConditions, aboutUs,
        faq, customerCareEmail, inviteMessage, storeLink,
        smtpHost, smtpPort, smtpUser, smtpPass, smtpFromEmail,
        welcomeEmailTemplate, purchaseEmailTemplate
      } = req.body;

      if (heroHeadline1 !== undefined) settings.heroHeadline1 = heroHeadline1;
      if (heroHeadline2 !== undefined) settings.heroHeadline2 = heroHeadline2;
      if (privacyPolicy !== undefined) settings.privacyPolicy = privacyPolicy;
      if (termsAndConditions !== undefined) settings.termsAndConditions = termsAndConditions;
      if (aboutUs !== undefined) settings.aboutUs = aboutUs;
      if (customerCareEmail !== undefined) settings.customerCareEmail = customerCareEmail;
      if (inviteMessage !== undefined) settings.inviteMessage = inviteMessage;
      if (storeLink !== undefined) settings.storeLink = storeLink;

      // SMTP Settings
      if (smtpHost !== undefined) settings.smtpHost = smtpHost;
      if (smtpPort !== undefined) settings.smtpPort = smtpPort;
      if (smtpUser !== undefined) settings.smtpUser = smtpUser;
      if (smtpPass !== undefined) settings.smtpPass = smtpPass;
      if (smtpFromEmail !== undefined) settings.smtpFromEmail = smtpFromEmail;

      // Templates
      if (welcomeEmailTemplate !== undefined) {
        settings.welcomeEmailTemplate = welcomeEmailTemplate;
        settings.markModified('welcomeEmailTemplate');
      }
      if (purchaseEmailTemplate !== undefined) {
        settings.purchaseEmailTemplate = purchaseEmailTemplate;
        settings.markModified('purchaseEmailTemplate');
      }

      // Arrays and subdocuments MUST be explicitly replaced + markModified
      if (marqueeText !== undefined) {
        settings.marqueeText = marqueeText;
        settings.markModified('marqueeText');
      }
      if (faq !== undefined) {
        settings.faq = faq;
        settings.markModified('faq');
      }

      settings.updatedAt = Date.now();
    }
    await settings.save();
    console.log(`[AppSettings] ✅ Saved. FAQ count: ${settings.faq.length}`);
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Error updating app settings', error: error.message });
  }
};
