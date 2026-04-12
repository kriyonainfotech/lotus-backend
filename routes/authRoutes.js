import express from 'express';
import { syncUser, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/sync', protect, syncUser);
router.get('/me', protect, getCurrentUser);

export default router;
