import User from '../models/User.js';
import Business from '../models/Business.js';

/**
 * POST /api/auth/sync
 * Called after Firebase OTP login.
 * Creates user if new, returns profile + `isNewUser` flag.
 * Protected via authMiddleware - `req.user` is populated.
 */
export const syncUser = async (req, res) => {
  try {
    const { firebaseUid, phoneNumber } = req.user;

    let user = await User.findOne({ firebaseUid });
    let isNewUser = false;

    if (!user) {
      user = await User.create({ firebaseUid, phoneNumber });
      isNewUser = true;
    }

    return res.status(200).json({
      success: true,
      message: isNewUser ? 'New user created' : 'User synced',
      user,
      isNewUser: !user.isProfileComplete,
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently logged in user based on the Firebase ID token in header.
 * Also fetches the associated Business details if they exist.
 */
export const getCurrentUser = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch business details
    const business = await Business.findOne({ userId: user._id }).populate('industryId', 'name icon');

    return res.status(200).json({
      success: true,
      user,
      business: business || null
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
