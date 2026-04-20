import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { sendPurchaseEmail } from '../services/emailService.js';

/**
 * POST /api/purchase/activate
 * Activates a plan for the user.
 * Body: { planName, price, durationMonths }
 */
export const activatePlan = async (req, res) => {
  try {
    const { firebaseUid } = req.user;
    const { planName, price, durationMonths } = req.body;

    if (!planName || !price || !durationMonths) {
      return res.status(400).json({ success: false, message: 'Missing plan details' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set end date
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Create subscription
    const subscription = await Subscription.create({
      userId: user._id,
      planName,
      price,
      endDate,
      status: 'active'
    });

    // Update user role or flag if needed (optional)
    // user.isPro = true;
    // await user.save();

    // Send Purchase Email (Non-blocking)
    if (user.email) {
      sendPurchaseEmail(user.email, user.name || 'Valued Member', planName).catch(err => 
        console.error('Error in sendPurchaseEmail trigger:', err)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Plan activated successfully',
      subscription
    });
  } catch (error) {
    console.error('Error activating plan:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
