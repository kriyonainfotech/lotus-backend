import Industry from '../models/Industry.js';
import Business from '../models/Business.js';
import User from '../models/User.js';

/**
 * GET /api/onboarding/industries
 * Returns full industry list. (Does NOT require auth)
 */
export const getIndustries = async (req, res) => {
  try {
    const industries = await Industry.find().sort({ name: 1 });
    return res.status(200).json({ success: true, industries });
  } catch (error) {
    console.error('Error fetching industries:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/onboarding/business
 * Saves business details. Protected by authMiddleware.
 */
export const saveBusinessDetails = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const { industryId, businessName, logoUrl, contactPhone } = req.body;

    if (!businessName) {
      return res.status(400).json({ success: false, message: 'businessName is required' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let business = await Business.findOne({ userId: user._id });
    if (business) {
      business.industryId = industryId || business.industryId;
      business.businessName = businessName;
      business.logoUrl = logoUrl || business.logoUrl;
      business.contactPhone = contactPhone || business.contactPhone;
      await business.save();
    } else {
      business = await Business.create({
        userId: user._id,
        industryId,
        businessName,
        logoUrl,
        contactPhone,
      });
    }

    return res.status(200).json({ success: true, message: 'Business details saved', business });
  } catch (error) {
    console.error('Error saving business details:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/onboarding/profile
 * Completes user profile. Protected by authMiddleware.
 * Sets isProfileComplete = true.
 */
export const completeUserProfile = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const { name, designation, dob, gender, email, city, avatarUrl } = req.body;

    if (!name || !city) {
      return res.status(400).json({ success: false, message: 'name and city are required' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: { name, designation, dob, gender, email, city, avatarUrl, isProfileComplete: true } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
