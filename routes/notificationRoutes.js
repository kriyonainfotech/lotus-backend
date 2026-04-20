import express from 'express';
import { sendMassNotification } from '../controllers/notificationController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admins can send mass notifications
router.post('/send', protect, isAdmin, sendMassNotification);

export default router;
