import express from 'express';
import { syncUser, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/sync — requires Firebase ID token in header
router.post('/sync', protect, syncUser);

// GET /api/auth/me — gets current user profile
router.get('/me', protect, getCurrentUser);

export default router;
