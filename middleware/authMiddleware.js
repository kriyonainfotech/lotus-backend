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
