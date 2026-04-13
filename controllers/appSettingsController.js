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
      Object.assign(settings, req.body);
      settings.updatedAt = Date.now();
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Error updating app settings', error: error.message });
  }
};
