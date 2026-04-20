import admin from 'firebase-admin';
import User from '../models/User.js';

/**
 * POST /api/notifications/send
 * Sends a push notification to all users or specific users.
 */
export const sendMassNotification = async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }

    console.log(`[NOTIF] Sending mass notification: "${title}" - "${body}"`);

    // Fetch all users who have an FCM token
    const users = await User.find({ fcmToken: { $ne: '', $exists: true } });
    console.log(`[NOTIF] Found ${users.length} users with FCM tokens in database.`);
    
    const tokens = users.map(user => user.fcmToken);

    if (tokens.length === 0) {
      console.log('[NOTIF] ❌ No valid FCM tokens found to send.');
      return res.status(404).json({ success: false, message: 'No users found with valid FCM tokens' });
    }

    console.log(`[NOTIF] Attempting to send to ${tokens.length} tokens...`);

    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl }),
      },
      tokens: tokens,
    };

    // Send messages in batches (multicast supports up to 500 tokens per call)
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} messages failed.`);

    return res.status(200).json({
      success: true,
      message: `Notification sent to ${response.successCount} users.`,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error('Error sending mass notification:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
