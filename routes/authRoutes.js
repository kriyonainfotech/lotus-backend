import express from 'express';
import { syncUser, getCurrentUser, updateFcmToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/sync', protect, syncUser);
router.get('/me', protect, getCurrentUser);
router.put('/fcm-token', protect, updateFcmToken);

export default router;
