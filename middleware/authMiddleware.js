import { admin } from '../config/firebaseAdmin.js';

/**
 * Middleware: Verifies Firebase ID Token from Authorization header.
 * Attaches decoded user info to `req.user`.
 *
 * Usage in routes: router.get('/protected', protect, handler)
 */
export const protect = async (req, res, next) => {
  console.log('[AUTH] PROTECT MIDDLEWARE HIT');
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. No token provided.'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // DEVELOPMENT BYPASS: Allow a test token for demonstration
    if (idToken === 'mock-jwt-token' || idToken.startsWith('mock-jwt-token-')) {
      req.user = {
        firebaseUid: 'mock_admin_123',
        phoneNumber: '0000000000',
        email: 'admin@lotus.com',
      };
      return next();
    }

    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach decoded user to request
    req.user = {
      firebaseUid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number || null,
      email: decodedToken.email || null,
    };

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.'
    });
  }
};

/**
 * Middleware: Checks if the user has admin role.
 * Should be used AFTER protect middleware.
 */
import User from '../models/User.js';

export const isAdmin = async (req, res, next) => {
  console.log(`[AUTH] isAdmin MIDDLEWARE HIT for UID: ${req.user.firebaseUid}`);
  try {
    const { firebaseUid } = req.user;

    // Bypass for development mock admin
    if (firebaseUid === 'mock_admin_123') {
      console.log('[AUTH] ✅ Mock Admin access granted');
      return next();
    }

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      console.log(`[AUTH] ❌ User not found in database for UID: ${firebaseUid}`);
      return res.status(403).json({ success: false, message: 'User not found' });
    }

    console.log(`[AUTH] User role for ${user.name || 'Unknown'}: ${user.role}`);

    if (user.role === 'admin') {
      console.log('[AUTH] ✅ Admin access granted');
      next();
    } else {
      console.log('[AUTH] ❌ Admin access denied: User is not an admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
  } catch (error) {
    console.error('[AUTH] ❌ Error in isAdmin middleware:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
